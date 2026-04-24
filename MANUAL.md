# 포트폴리오 템플릿 설치 매뉴얼

## 1. 템플릿 다운로드 및 준비

### 1.1 폴더 위치
프로젝트 폴더: `Portfolio-main/portfolio-template`

### 1.2 압축 해제 (다른 PC에서 작업 시)
1. `Portfolio-main` 폴더를 ZIP으로 압축
2. 새 PC에서 압축 해제
3. 터미널에서 해당 폴더로 이동:
```bash
cd portfolio-template
```

---

## 2. Supabase 프로젝트 생성

### 2.1 계정 생성
1. [supabase.com](https://supabase.com) 접속
2. GitHub으로 로그인 또는 이메일로 회원가입
3. 무료 플랜 선택

### 2.2 새 프로젝트 생성
1. 대시보드에서 **New project** 클릭
2. 다음과 같이 입력:
   - **Organization**:任意 (예: personal)
   - **Name**: `portfolio` (또는 원하는 이름)
   - **Database Password**: 12자 이상 복잡한 비밀번호 생성 → 메모장에 저장
   - **Region**: `Northeast Asia (Seoul)` 선택
   - **Pricing Plan**: **Free** 선택
3. **Create new project** 클릭
4. 프로젝트 생성 대기 (약 1~2분)

---

## 3. 데이터베이스 테이블 생성

### 3.1 SQL 에디터 열기
1. 생성된 프로젝트 클릭
2. 왼쪽 메뉴에서 **SQL Editor** 클릭
3. 다음 SQL 복사 후 붙여넣기:

```sql
-- 포트폴리오 테이블 생성
CREATE TABLE public.portfolio (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'vision' CHECK (category IN ('vision', 'experience', 'achievement')),
  description TEXT,
  image_url TEXT,
  video_url TEXT,
  is_representative BOOLEAN DEFAULT false,
  date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 테이블 확인
SELECT * FROM public.portfolio LIMIT 0;
```

4. **Run** 클릭
5. 하단 결과에 "Success" 또는 "CREATE TABLE" 메시지 확인

### 3.2 RLS (행 수준 보안) 비활성화
추가 SQL 실행:

```sql
-- RLS 비활성화 (공개 읽기 허용)
ALTER TABLE public.portfolio DISABLE ROW LEVEL SECURITY;
```

---

## 4. Storage 버킷 생성

### 4.1 Storage 메뉴 이동
1. 왼쪽 메뉴에서 **Storage** 클릭
2. **New bucket** 클릭

### 4.2 이미지 버킷 생성
1. **Name**: `portfolio-media`
2. **Public bucket**: ✅ 체크
3. **File size limit**: `5` MB (이미지용)
4. **Allowed file types**: `Images` 체크
5. **Create bucket** 클릭

### 4.3 영상용 폴더 생성
1. 생성된 버킷 클릭
2. **New folder** 클릭
3. **Name**: `videos` 입력
4. **Create folder** 클릭

### 4.4 이미지용 폴더 생성
1. **New folder** 클릭
2. **Name**: `images` 입력
3. **Create folder** 클릭

### 4.5 Storage 정책 설정
1. 버킷 내 `images` 폴더 클릭
2. **New policy** 클릭
3. 다음과 같이 설정:

| 항목 | 값 |
|------|-----|
| Policy name | `Allow public read` |
| Policy mode | **Read** |
| Allowed source | **All** |

4. **Save policy** 클릭

5. `videos` 폴더도 동일한 정책 생성

---

## 5. API 키 확인

### 5.1 프로젝트 설정
1. 왼쪽 메뉴 아래 **Project Settings** (⚙️ 아이콘) 클릭
2. **API** 메뉴 클릭

### 5.2 키 복사
- **Project URL**: `https://xxxxx.supabase.co` → 복사
- **anon public key**: `eyJ...`로 시작하는 긴 문자열 → 복사
- **service_role key**: 아래쪽 **Service role** 섹션에서 복사

> ⚠️ **중요**: service_role 키는 절대 공개되지 않도록 주의

---

## 6. 환경변수 설정

### 6.1 파일 생성
프로젝트 루트에 `.env.local` 파일 생성:

```env
# Supabase 설정 (필수)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 관리자 비밀번호 (필수 - 원하는 비밀번호로 변경)
NEXT_PUBLIC_ADMIN_PASSWORD=your-password
```

### 6.2 값 채우기
| 변수 | 값 |
|------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | 5.1에서 복사한 Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 5.1에서 복사한 anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | 5.1에서 복사한 service_role key |
| `NEXT_PUBLIC_ADMIN_PASSWORD` | 원하는 관리자 비밀번호 |

---

## 7. 의존성 설치 및 실행

### 7.1 패키지 설치
```bash
npm install
```

### 7.2 개발 서버 실행
```bash
npm run dev
```

### 7.3 접속 확인
브라우저에서 `http://localhost:3000` 접속

---

## 8. 관리자 페이지 사용

### 8.1 접근
- `http://localhost:3000/admin` 접속

### 8.2 로그인
- 환경변수에 설정한 비밀번호 입력
- 로그인 후 로컬 스토리지에 저장됨

### 8.3 항목 추가
1. **+ 새 항목 추가** 클릭
2. 제목, 카테고리, 설명 입력
3. **파일 선택** 버튼으로 이미지 업로드 (5MB 이하)
4. 필요시 영상도 동일하게 업로드 (50MB 이하)
5. **저장** 클릭

### 8.4 항목 수정/삭제
- 목록에서 수정 또는 삭제 버튼 클릭

---

## 9. 배포 (Vercel)

### 9.1 GitHub 업로드
1. GitHub에서 새 레포지토리 생성
2. 로컬 폴더를 GitHub에 푸시:
```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/your-username/repo.git
git push -u origin main
```

### 9.2 Vercel 배포
1. [vercel.com](https://vercel.com) 접속
2. **Add New...** → **Project** 클릭
3. 방금 만든 GitHub 레포지토리 선택
4. **Environment Variables** 섹션에서:
   - `NEXT_PUBLIC_SUPABASE_URL` 값 입력
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` 값 입력
   - `NEXT_PUBLIC_ADMIN_PASSWORD` 값 입력
   - `SUPABASE_SERVICE_ROLE_KEY` 값 입력 (Vercel 환경변수에는 포함하지 않음 - 보안 주의)
5. **Deploy** 클릭

> ⚠️ **service_role 키는 Vercel에 배포하지 마세요**. 관리자 페이지 로컬에서만 사용해야 합니다.

---

## 10. 문제 해결

### Q: 데이터가 안 보입니다
A: SQL Editor에서 다음 쿼리로 데이터 확인:
```sql
SELECT * FROM public.portfolio;
```

### Q: 이미지가 업로드 안 됩니다
A: Storage 버킷政策和 확인:
1. Storage → portfolio-media 버킷
2. 각 폴더의 Policy가 "Allow public read"로 되어 있는지 확인

### Q: 관리자 페이지 접속 안 됩니다
A: 환경변수 확인:
1. `.env.local` 파일 존재 확인
2. 값이 모두 채워져 있는지 확인
3. 서버 재시작: `Ctrl+C` 후 `npm run dev`

---

## 완료 체크리스트

- [ ] Supabase 프로젝트 생성
- [ ] portfolio 테이블 생성 (SQL)
- [ ] RLS 비활성화
- [ ] Storage 버킷 생성 (portfolio-media)
- [ ] images, videos 폴더 생성
- [ ] Storage 정책 설정
- [ ] API 키 확인 및 저장
- [ ] .env.local 파일 생성
- [ ] npm install 실행
- [ ] npm run dev 실행
- [ ] http://localhost:3000 접속 확인
- [ ] http://localhost:3000/admin 접속 확인
- [ ] 관리자 로그인 확인
- [ ] 항목 추가 테스트
- [ ] 이미지 업로드 테스트