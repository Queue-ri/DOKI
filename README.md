## DOKI - 실시간 백화점 팝업스토어 예약 플랫폼 📅

DOKI는 백화점 및 팝업스토어 운영자에게 **통합된 고객 데이터**를,<br>
예약 이용자에게 **일관되고 안정된 예약 경험**을 제공하기 위한 플랫폼입니다.

<a href=""><img src="https://img.shields.io/badge/🌐-Live Demo-d9fc0e?style=for-the-badge&logoColor=white"></a>&nbsp;
<a href=""><img src="https://img.shields.io/badge/🔗-WBS-0078D7?style=for-the-badge&logoColor=white"></a>&nbsp;
<a href=""><img src="https://img.shields.io/badge/🔗-ERD-0078D7?style=for-the-badge&logoColor=white"></a>&nbsp;
<a href=""><img src="https://img.shields.io/badge/🔗-Flow_Chart-0078D7?style=for-the-badge&logoColor=white"></a>

<br>

### 💭 프로젝트 동기

DOKI 프로젝트는 단순 기능 구현이 아닌 도메인에 대한 깊은 기술적 고찰의 필요성으로부터 출발했습니다.<br>
수많은 도메인 중 '예약' 도메인은, 그 중에서도 보편적이면서 확장성이 큰 도메인입니다.

예약 도메인에서는 백화점 팝업스토어가 높은 수요를 보이고 있으며, 옴니채널 마케팅 전략의 핵심으로 성장하고 있습니다.<br>
하지만 다음과 같은 문제가 존재합니다.

- 이용자: 팝업스토어마다 달라지는 **비일관적 예약 경험**
- 운영자: 고객 데이터 **통합, 분석의 어려움**

따라서 DOKI 프로젝트는 **예약 채널과 고객 데이터를 통합**하여, 위 문제들을 해결하고자 합니다.

<br>

### 📚️ 기술적 성과

본 프로젝트를 통해 아래와 같은 경험과 지식을 쌓아가고 있습니다.

#### 시스템 안정성
- Kafka 기반 메시지 큐를 활용한 순간적 예약 트래픽 부하 처리
- Pessimistic Lock을 적용해 20만 건 동시 예약에서 데이터 무결성 확보
- 멀티모듈 아키텍처 기반의 애플리케이션 서버 구축 경험
- AWS 클라우드 환경 기반의 CI/CD 무중단 배포 인프라 구축

#### 프로세스 최적화
- Elasticsearch 및 Redis 캐싱을 통한 조회/검색 응답 속도 개선
- ELK 스택 기반의 로그/health check 시각화 시스템 구축 👉 에러 진단 시간 단축
- AWS Lambda 기반 이미지 자동 최적화 및 CDN 배포 파이프라인 구축 👉 비용 절약 및 로딩 속도 향상

#### 기타
- SSE 기반 실시간 예약 현황 알림 👉 자동 뷰 업데이트, 사용자 경험 개선
- SSR 방식의 운영자용 백오피스 구현

<br>