from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, UploadFile, File, Form, Header, Query, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
import re
import requests
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="CyberGuard API")
api_router = APIRouter(prefix="/api")

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

# ===== Object Storage =====
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "cyberguard"
storage_key: Optional[str] = None


def init_storage():
    global storage_key
    if storage_key:
        return storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    return storage_key


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120
    )
    resp.raise_for_status()
    return resp.json()


def get_object(path: str):
    key = init_storage()
    resp = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key}, timeout=60
    )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


# ===== Models =====
class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    is_admin: bool = True  # First-login owner model: any authenticated user is admin
    created_at: str


class Post(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    slug: str
    category: str  # 'analiz' | 'reverse' | 'bootkit'
    excerpt: str = ""
    content: str = ""
    code_block: Optional[str] = None
    code_language: Optional[str] = "asm"
    image_path: Optional[str] = None  # storage path
    featured: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class PostCreate(BaseModel):
    title: str
    category: str
    excerpt: str = ""
    content: str = ""
    code_block: Optional[str] = None
    code_language: Optional[str] = "asm"
    image_path: Optional[str] = None
    featured: bool = False


class PostUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    code_block: Optional[str] = None
    code_language: Optional[str] = None
    image_path: Optional[str] = None
    featured: Optional[bool] = None


class ContactMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    message: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class ContactCreate(BaseModel):
    name: str
    email: str
    message: str


def slugify(text: str) -> str:
    text = text.lower().strip()
    # Turkish chars
    repl = {"ı": "i", "ğ": "g", "ü": "u", "ş": "s", "ö": "o", "ç": "c", "İ": "i"}
    for k, v in repl.items():
        text = text.replace(k, v)
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"\s+", "-", text)
    text = re.sub(r"-+", "-", text)
    return text[:80] or str(uuid.uuid4())[:8]


# ===== Auth =====
async def get_current_user(request: Request, authorization: Optional[str] = Header(None)) -> Optional[dict]:
    token = request.cookies.get("session_token")
    if not token and authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")
    if not token:
        return None
    session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session:
        return None
    expires_at = session["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        return None
    user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    return user


async def require_admin(request: Request, authorization: Optional[str] = Header(None)):
    user = await get_current_user(request, authorization)
    if not user or not user.get("is_admin"):
        raise HTTPException(status_code=401, detail="Yetkisiz erişim")
    return user


# ===== Auth Endpoints =====
@api_router.post("/auth/session")
async def create_session(payload: dict, response: Response):
    session_id = payload.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id missing")
    
    r = requests.get(
        "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
        headers={"X-Session-ID": session_id}, timeout=15
    )
    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid session")
    data = r.json()
    
    existing = await db.users.find_one({"email": data["email"]}, {"_id": 0})
    if existing:
        user_id = existing["user_id"]
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": data["name"], "picture": data.get("picture")}}
        )
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": user_id,
            "email": data["email"],
            "name": data["name"],
            "picture": data.get("picture"),
            "is_admin": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": data["session_token"],
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    response.set_cookie(
        key="session_token",
        value=data["session_token"],
        max_age=7 * 24 * 60 * 60,
        httponly=True,
        secure=True,
        samesite="none",
        path="/"
    )
    
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    return {"user": user, "session_token": data["session_token"]}


@api_router.get("/auth/me")
async def auth_me(request: Request, authorization: Optional[str] = Header(None)):
    user = await get_current_user(request, authorization)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user


@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    token = request.cookies.get("session_token")
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    response.delete_cookie("session_token", path="/")
    return {"ok": True}


# ===== Posts CRUD =====
@api_router.get("/posts")
async def list_posts(category: Optional[str] = None):
    q = {}
    if category:
        q["category"] = category
    docs = await db.posts.find(q, {"_id": 0}).sort("created_at", -1).to_list(500)
    return docs


@api_router.get("/posts/featured")
async def featured_post():
    doc = await db.posts.find_one({"featured": True, "category": "bootkit"}, {"_id": 0}, sort=[("created_at", -1)])
    if not doc:
        doc = await db.posts.find_one({"featured": True}, {"_id": 0}, sort=[("created_at", -1)])
    return doc


@api_router.get("/posts/{slug}")
async def get_post(slug: str):
    doc = await db.posts.find_one({"slug": slug}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Yazı bulunamadı")
    return doc


@api_router.post("/posts")
async def create_post(payload: PostCreate, user=Depends(require_admin)):
    slug_base = slugify(payload.title)
    slug = slug_base
    n = 1
    while await db.posts.find_one({"slug": slug}):
        n += 1
        slug = f"{slug_base}-{n}"
    post = Post(slug=slug, **payload.model_dump())
    await db.posts.insert_one(post.model_dump())
    return post.model_dump()


@api_router.put("/posts/{post_id}")
async def update_post(post_id: str, payload: PostUpdate, user=Depends(require_admin)):
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    if "title" in updates:
        slug_base = slugify(updates["title"])
        slug = slug_base
        n = 1
        while await db.posts.find_one({"slug": slug, "id": {"$ne": post_id}}):
            n += 1
            slug = f"{slug_base}-{n}"
        updates["slug"] = slug
    res = await db.posts.update_one({"id": post_id}, {"$set": updates})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Yazı bulunamadı")
    return await db.posts.find_one({"id": post_id}, {"_id": 0})


@api_router.delete("/posts/{post_id}")
async def delete_post(post_id: str, user=Depends(require_admin)):
    res = await db.posts.delete_one({"id": post_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Yazı bulunamadı")
    return {"ok": True}


# ===== Uploads =====
@api_router.post("/upload")
async def upload_file(file: UploadFile = File(...), user=Depends(require_admin)):
    ext = (file.filename.rsplit(".", 1)[-1] if "." in file.filename else "bin").lower()
    allowed = {"jpg", "jpeg", "png", "gif", "webp"}
    if ext not in allowed:
        raise HTTPException(status_code=400, detail=f"Sadece resim dosyaları kabul edilir (jpg/png/gif/webp). Yüklenen: .{ext}")
    path = f"{APP_NAME}/uploads/{user['user_id']}/{uuid.uuid4()}.{ext}"
    data = await file.read()
    if len(data) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Dosya 10MB'tan büyük olamaz")
    try:
        result = put_object(path, data, file.content_type or f"image/{ext}")
    except requests.HTTPError as e:
        logger.error(f"Storage upload failed: {e.response.status_code} {e.response.text}")
        raise HTTPException(status_code=502, detail=f"Depolama hatası: {e.response.status_code}")
    except Exception as e:
        logger.exception("Upload error")
        raise HTTPException(status_code=500, detail=f"Upload başarısız: {str(e)}")
    await db.files.insert_one({
        "id": str(uuid.uuid4()),
        "storage_path": result["path"],
        "original_filename": file.filename,
        "content_type": file.content_type,
        "size": result["size"],
        "user_id": user["user_id"],
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    return {"path": result["path"], "url": f"/api/files/{result['path']}"}


@api_router.get("/files/{path:path}")
async def serve_file(path: str):
    record = await db.files.find_one({"storage_path": path, "is_deleted": False}, {"_id": 0})
    if not record:
        raise HTTPException(status_code=404, detail="Dosya bulunamadı")
    data, content_type = get_object(path)
    return Response(content=data, media_type=record.get("content_type") or content_type)


# ===== Contact =====
@api_router.post("/contact")
async def contact_submit(payload: ContactCreate):
    msg = ContactMessage(**payload.model_dump())
    await db.contact_messages.insert_one(msg.model_dump())
    return {"ok": True, "id": msg.id}


@api_router.get("/contact")
async def contact_list(user=Depends(require_admin)):
    docs = await db.contact_messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return docs


# ===== Seed =====
@api_router.post("/seed")
async def seed_demo():
    if await db.posts.count_documents({}) > 0:
        return {"ok": True, "seeded": False}
    
    samples = [
        {
            "title": "BIOS & MBR Bootkit Analizi: Düşük Seviye Tehditler",
            "category": "bootkit",
            "excerpt": "BIOS ve Master Boot Record bölgelerine yerleşen bootkit zararlılarının davranış analizi ve tespit yöntemleri.",
            "content": "Bootkit, sistem önyükleme sürecine müdahale eden ve işletim sisteminden önce çalışan bir tür rootkit'tir. BIOS, UEFI veya MBR bölgesine yerleşerek tüm güvenlik katmanlarını atlatabilir.\n\nBu yazıda klasik MBR bootkit'lerinin çalışma prensiplerini, INT 13h kesme servislerinin nasıl kancalandığını ve modern UEFI tabanlı varyantların güvenli önyükleme (Secure Boot) mekanizmasını nasıl atlatmaya çalıştığını inceleyeceğiz.\n\nÖrnek vakalar: TDL4, Mebromi, MoonBounce ve LoJax. Hepsi farklı katmanları hedeflese de ortak hedef aynı: kalıcılık ve görünmezlik.",
            "code_block": "; Klasik MBR Bootkit yükleyici - Gerçek Mod (16-bit)\n[BITS 16]\n[ORG 0x7C00]\n\nstart:\n    cli\n    xor    ax, ax\n    mov    ds, ax\n    mov    es, ax\n    mov    ss, ax\n    mov    sp, 0x7C00\n    sti\n\n    ; Orijinal MBR'i 0x7E00 adresine yükle\n    mov    ah, 0x02     ; BIOS oku\n    mov    al, 0x01     ; 1 sektör\n    mov    ch, 0x00\n    mov    cl, 0x02     ; sektör 2\n    mov    dh, 0x00\n    mov    bx, 0x7E00\n    int    0x13\n    jc     hata\n\n    ; INT 13h kancasını kur\n    call   hook_int13\n    jmp    0x0000:0x7E00\n\nhata:\n    hlt\n    jmp    hata",
            "code_language": "asm",
            "image_path": None,
            "featured": True,
        },
        {
            "title": "Emotet Bankacılık Truva Atı: Davranışsal İnceleme",
            "category": "analiz",
            "excerpt": "Emotet'in modüler yapısı, C2 iletişimi ve makro tabanlı bulaşma vektörü.",
            "content": "Emotet, başlangıçta bankacılık truva atı olarak tasarlanmış ancak yıllar içinde modüler bir zararlı yazılım dağıtım platformuna dönüşmüştür.\n\nMakro içeren Office belgeleri aracılığıyla yayılır. İlk aşamada PowerShell ile ikincil bir payload indirir, ardından LSASS'tan kimlik bilgilerini çıkararak yanal hareket başlatır.",
            "code_block": None,
            "image_path": None,
            "featured": False,
        },
        {
            "title": "WannaCry Fidye Yazılımı: EternalBlue İstismarı",
            "category": "analiz",
            "excerpt": "SMBv1 zafiyetini kullanan kurtçuk benzeri yayılma mekanizması ve kill-switch alan adı.",
            "content": "WannaCry, 2017 yılında küresel ölçekte 200.000'den fazla bilgisayarı etkileyen fidye yazılımıdır. NSA'ten sızdırılan EternalBlue istismarını kullanır.\n\nÖnemli detay: araştırmacı Marcus Hutchins tarafından keşfedilen 'kill-switch' alan adı, yazılımın daha fazla yayılmasını engellemiştir.",
            "code_block": None,
            "image_path": None,
            "featured": False,
        },
        {
            "title": "Stuxnet Solucanı: Endüstriyel Sabotaj",
            "category": "reverse",
            "excerpt": "PLC programlamasını hedef alan ilk siber silah; rotor frekansı manipülasyonu üzerinden derinlemesine kod analizi.",
            "content": "Stuxnet, endüstriyel kontrol sistemlerini (ICS/SCADA) hedef alan ilk büyük çaplı zararlı yazılım olarak tarihe geçti. Siemens S7-300 PLC'leri üzerinden İran'ın Natanz tesisindeki santrifüjleri sabote etmek üzere tasarlandı.\n\nWindows üzerinde dört adet sıfırıncı gün açığını kullanıyor, dijital sertifikalar ile imzalı sürücüler yüklüyordu.",
            "code_block": "; Stuxnet benzeri payload deşifre rutini (basitleştirilmiş)\n.text:00401000 decrypt_payload proc near\n.text:00401000     push    ebp\n.text:00401001     mov     ebp, esp\n.text:00401003     mov     esi, [ebp+payload_ptr]\n.text:00401006     mov     ecx, [ebp+size]\n.text:00401009     mov     al, 0xAA       ; XOR key\n.text:0040100B\n.text:0040100B decrypt_loop:\n.text:0040100B     xor     byte ptr [esi], al\n.text:0040100D     rol     al, 1          ; key rotation\n.text:0040100F     inc     esi\n.text:00401010     loop    decrypt_loop\n.text:00401012     pop     ebp\n.text:00401013     retn\n.text:00401013 decrypt_payload endp",
            "code_language": "asm",
            "image_path": None,
            "featured": False,
        },
        {
            "title": "Mirai Botnet: IoT Cihazları Üzerinden DDoS",
            "category": "analiz",
            "excerpt": "Telnet tarama, varsayılan kimlik bilgileri ve devasa hacimli DNS saldırıları.",
            "content": "Mirai, IoT cihazlarındaki varsayılan kullanıcı adı/şifre kombinasyonlarını kullanarak yayılan bir botnet'tir. 2016'da Dyn DNS hizmetine yapılan tarihi DDoS saldırısının arkasındaki güçtür.",
            "code_block": None,
            "image_path": None,
            "featured": False,
        },
        {
            "title": "Reverse Engineering: PE Dosya Yapısının Anatomisi",
            "category": "reverse",
            "excerpt": "DOS header, NT headers, section table ve IAT/EAT yapılarının disassembler perspektifinden analizi.",
            "content": "Portable Executable (PE) formatı, Windows ekosisteminin temelidir. Bir PE dosyasını tersine mühendislik yapabilmek için DOS başlığından başlayıp Import Address Table'a (IAT) kadar tüm yapıyı anlamak gerekir.",
            "code_block": "; PE Header doğrulama rutini\n.text:00402000 verify_pe proc near\n.text:00402000     mov     eax, [esp+4]        ; base addr\n.text:00402004     cmp     word ptr [eax], 'ZM' ; MZ?\n.text:00402008     jne     not_pe\n.text:0040200A     mov     ebx, [eax+0x3C]     ; e_lfanew\n.text:0040200D     add     ebx, eax\n.text:0040200F     cmp     dword ptr [ebx], 'EP' ; PE\\0\\0\n.text:00402015     jne     not_pe\n.text:00402017     mov     eax, 1\n.text:0040201C     retn\n.text:0040201D not_pe:\n.text:0040201D     xor     eax, eax\n.text:0040201F     retn\n.text:0040201F verify_pe endp",
            "code_language": "asm",
            "image_path": None,
            "featured": False,
        },
    ]
    for s in samples:
        slug = slugify(s["title"])
        post = Post(slug=slug, **s)
        await db.posts.insert_one(post.model_dump())
    return {"ok": True, "seeded": True, "count": len(samples)}


@api_router.get("/")
async def root():
    return {"message": "CyberGuard API", "status": "online"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    try:
        init_storage()
        logger.info("Storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
