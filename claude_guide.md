---
  1. 폴더 구조 이해

  hwanlog.github.io-main/
  ├── blog/
  │   ├── algorithm/_posts/   ← 알고리즘 포스트 여기에
  │   ├── security/_posts/    ← 보안 포스트 여기에
  │   ├── c/_posts/           ← C언어 포스트 여기에
  │   ├── computersystem/_posts/
  │   └── diary/_posts/       ← 회고 포스트 여기에
  ├── _featured_categories/   ← 카테고리 페이지 설정
  ├── _projects/              ← 프로젝트 페이지
  ├── assets/img/             ← 이미지 저장
  └── _config.yml             ← 블로그 전체 설정

  ---
  2. 포스트 작성법

  파일 만들기

  해당 카테고리 _posts 폴더에 파일 생성. 파일명 규칙 필수:
  YYYY-MM-DD-영문제목.md
  예: blog/algorithm/_posts/2024-05-28-bfs-dfs.md

  파일 내용 기본 틀

  ---
  layout: post
  title: BFS/DFS 정리
  description: 너비우선탐색과 깊이우선탐색 개념 정리
  categories: [algorithm]
  tags: [bfs, dfs, graph]
  ---

  여기서부터 본문 작성
  
  ▎ categories 는 폴더명과 일치해야 해요 (algorithm, security, c, computersystem, diary)
  
  ---
  3. 마크다운 자주 쓰는 문법

  코드 블록 
  ```python
  def solution(n):
      return n * 2
  ``` 

  목차 자동생성 (포스트 상단에 추가)
  * 목차
  {:toc}

  노트 박스
  이건 참고사항입니다.
  {:.note}

  강조 텍스트
  크게 강조할 내용
  {:.lead}

  ---
  4. 이미지 넣기

  1. assets/img/ 에 이미지 파일 넣기
  2. 포스트에서 사용:
  ![설명](/assets/img/파일명.png)

  전체 너비로 크게 보여주고 싶을 때:
  ![설명](/assets/img/파일명.png){:.lead width="800" height="400" loading="lazy"}

  ---
  5. 카테고리 추가하고 싶을 때

  ① 폴더 생성
  blog/python/_posts/
  ② _featured_categories/PYTHON.md 파일 생성
  ---
  코드 블록
  ```python
  def solution(n):
      return n * 2
  ```

  목차 자동생성 (포스트 상단에 추가)
  * 목차
  {:toc}

  노트 박스
  이건 참고사항입니다.
  {:.note}

  강조 텍스트
  크게 강조할 내용
  {:.lead}

  ---
  4. 이미지 넣기

  1. assets/img/ 에 이미지 파일 넣기
  2. 포스트에서 사용:
  ![설명](/assets/img/파일명.png)

  전체 너비로 크게 보여주고 싶을 때:
  ![설명](/assets/img/파일명.png){:.lead width="800" height="400" loading="lazy"}

  ---
  5. 카테고리 추가하고 싶을 때

  예를 들어 Python 카테고리를 추가한다면:

  ① 폴더 생성
  blog/python/_posts/

  ② _featured_categories/PYTHON.md 파일 생성
  ---
  layout: list
  title: PYTHON
  slug: python
  description: 파이썬 관련 내용
  sitemap: true
  ---

  ③ _config.yml 의 menu에 추가
  menu:
    - title: PYTHON
      url: /python/

  ---
  6. 로컬 미리보기

  bundle exec jekyll serve --port 4001
  → http://localhost:4001 접속

  파일 수정하면 자동으로 재빌드돼요. 브라우저 새로고침만 하면 됨.

  ---
  7. GitHub Pages 배포

  나중에 GitHub에 올릴 때 레포 이름을 JeonghwanY.github.io 로 만들면 자동으로 https://JeonghwanY.github.io 주소로 배포돼요.

  git init
  git add .
  git commit -m "첫 블로그 세팅"
  git remote add origin https://github.com/JeonghwanY/JeonghwanY.github.io
  git push -u origin main

  ---