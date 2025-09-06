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

### ⚡️ 주요 기능 소개

#### [이용자] 실시간 팝업스토어 예약

#### [운영자] 실시간 예약 내역 관리

#### [관리자] 실시간 로그/헬스체크 모니터링

<br>

### 🛠️ 기술스택 및 선정 이유

> [!NOTE]
> 아키텍처 전반에 걸쳐 안정성, 확장성, 운영 효율성을 고려하여 기술 스택을 선정했습니다.  
> 상세한 선정 이유는 [블로그 포스트](https://qriosity.dev)에서 확인하실 수 있습니다.

#### 전체 아키텍처 도식

#### 기술스택 목록

<details>
<summary>자세히 보기</summary>

#### 애플리케이션
- Spring Cloud API Gateway
- Spring Cloud Service Discovery
- Spring Cloud Eureka
- Spring Logback
- Spring JPA
- Thymeleaf
- Kafka
- JWT

#### 데이터베이스
- MySQL
- Redis

#### 검색 및 로그 모니터링
- Elasticsearch
- Logstash
- Kibana

#### 인프라
- AWS Lambda
- AWS ELB
- AWS IAM
- AWS Route53
- AWS Cloudfront
- AWS EC2
- AWS RDS
- AWS S3

#### DevOps
- Docker Compose
- GitHub Actions

#### 테스트
- JUnit
- JMeter
- Swagger
- Postman

#### 프로젝트 관리
- Git
- Trello
- Slack
- Figma

</details>

<br>

### ⚡️ 트러블슈팅 및 회고

프로젝트 진행 중 마주했던 다양한 이슈의 해결 과정과 생각들을 기술 블로그에서 만나보실 수 있습니다.

- [컨테이너 환경의 Spring에서 발생한 CgroupInfo anyController is null 에러 회고](https://qriosity.dev/post/%EC%BB%A8%ED%85%8C%EC%9D%B4%EB%84%88-%ED%99%98%EA%B2%BD%EC%9D%98-spring%EC%97%90%EC%84%9C-%EB%B0%9C%EC%83%9D%ED%95%9C-cgroupinfo-anycontroller-is-null-%EC%97%90%EB%9F%AC-%ED%9A%8C%EA%B3%A0)
- [Docker Compose와 Spring 멀티모듈: 환경별 프로퍼티 관리와 엔드포인트 이슈 해결기](https://qriosity.dev/post/docker-compose%EC%99%80-spring-%EB%A9%80%ED%8B%B0%EB%AA%A8%EB%93%88-%ED%99%98%EA%B2%BD%EB%B3%84-%ED%94%84%EB%A1%9C%ED%8D%BC%ED%8B%B0-%EA%B4%80%EB%A6%AC%EC%99%80-%EC%97%94%EB%93%9C%ED%8F%AC%EC%9D%B8%ED%8A%B8-%EC%9D%B4%EC%8A%88-%ED%95%B4%EA%B2%B0%EA%B8%B0)