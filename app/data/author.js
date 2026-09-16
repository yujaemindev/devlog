import JavascriptIcon from "~/assets/devicon/javascript.svg?component";
import TypescriptIcon from "~/assets/devicon/typescript.svg?component";
import PythonIcon from "~/assets/devicon/python.svg?component";
import JavaIcon from "~/assets/devicon/java.svg?component";
import NodeIcon from "~/assets/devicon/node.svg?component";
import VueIcon from "~/assets/devicon/vuejs.svg?component";
import ReactIcon from "~/assets/devicon/reactnative.svg?component";
import ReactNativeIcon from "~/assets/devicon/reactnative.svg?component";
import AngularJSIcon from "~/assets/devicon/angularjs.svg?component";
import SpringBootIcon from "~/assets/devicon/springboot.svg?component";
import JenkinsIcon from "~/assets/devicon/jenkins.svg?component";
import MariaDBIcon from "~/assets/devicon/mariadb.svg?component";
import ElasticSearchIcon from "~/assets/devicon/aws-elasticsearch.svg?component";
import CloudFrontIcon from "~/assets/devicon/aws-cloudfront.svg?component";
import KinesisIcon from "~/assets/devicon/aws-kinesis.svg?component";
import RdsIcon from "~/assets/devicon/aws-rds.svg?component";
import S3Icon from "~/assets/devicon/aws-s3.svg?component";
import EC2Icon from "~/assets/devicon/aws-ec2.svg?component";
import DockerIcon from "~/assets/devicon/docker.svg?component";
import NestIcon from "~/assets/devicon/nestjs.svg?component";
import TypeormIcon from "~/assets/devicon/typeorm.svg?component";
import RedisIcon from "~/assets/devicon/redis.svg?component";
import NginxIcon from "~/assets/devicon/nginx.svg?component";
import BullmqImage from "~/assets/devicon/bullmq.png";
import SmartphoneIcon from "~/assets/icons/smartphone.svg?component";

// Timeline
import Academy from "~/assets/icons/academy.svg?component";

const author = {
  author_image: "/my.jpg",
  name: "유재민",
  position: "Web Service Team Lead / Full Stack Developer",
  email: "jaeminy4341@gmail.com",
  location: "Seoul, Korea",
  github: "yujaemindev",
  socials: {
    instagram: "https://www.instagram.com/jaeminy4341/",
    twitter: "#",
    stackoverflow: "#",
    youtube: "#",
    linkedin:
      "https://www.linkedin.com/in/%EC%9E%AC%EB%AF%BC-%EC%9C%A0-705960247/",
    facebook: "#",
  },
  careerHighlights: [
    {
      value: "11+ Years",
      title: "Web Service Development",
      description:
        "엔터프라이즈 그룹웨어부터 스타트업·창업, AI SaaS까지 제품의 설계·개발·운영을 경험했습니다.",
    },
    {
      value: "7 Members",
      title: "Web / AI Team Lead",
      description:
        "Web 개발 4명으로 구성된 팀을 리드하며 AI 개발팀과 협업하여 JIRA 기반 Sprint 단위 개발 프로세스 구축 및 협업 체계를 운영했습니다.",
    },
    {
      value: "₩300M+ / 6mo",
      title: "Startup & B2B Growth",
      description:
        "K-패션 플랫폼을 창업해 서비스 출시부터 B2B 확장까지 직접 수행했고, B2B 판매 전환 후 6개월 내 3억원 이상의 매출을 경험했습니다.",
    },
    {
      value: "1,800+ Jobs",
      title: "AI SaaS & Reliability",
      description:
        "대용량 영상/이미지 기반 AI Pipeline을 제품화하고 1,800건 이상의 연속 작업 처리와 GS/TTA 인증·납품까지 수행했습니다.",
    },
  ],
  expertises: {
    Language: [
      { name: "JavaScript", icon: JavascriptIcon, description: "" },
      { name: "TypeScript", icon: TypescriptIcon, description: "" },
      { name: "Java", icon: JavaIcon, description: "" },
      { name: "Python", icon: PythonIcon, description: "" },
    ],
    "Frontend / Mobile": [
      { name: "React", icon: ReactIcon, description: "" },
      { name: "Vue.js", icon: VueIcon, description: "" },
      { name: "AngularJS", icon: AngularJSIcon, description: "" },
      { name: "React Native", icon: ReactNativeIcon, description: "" },
      { name: "Android / iOS Hybrid", icon: SmartphoneIcon, description: "" },
    ],
    "Backend / Data": [
      { name: "Node.js", icon: NodeIcon, description: "" },
      { name: "NestJS", icon: NestIcon, description: "" },
      { name: "Spring Boot", icon: SpringBootIcon, description: "" },
      { name: "TypeORM", icon: TypeormIcon, description: "" },
      { name: "MySQL / MariaDB", icon: MariaDBIcon, description: "" },
      { name: "Redis", icon: RedisIcon, description: "" },
      { name: "BullMQ", image: BullmqImage, description: "" },
      { name: "OpenSearch", icon: ElasticSearchIcon, description: "" },
    ],
    "DevOps / Cloud": [
      { name: "Docker", icon: DockerIcon, description: "" },
      { name: "Jenkins", icon: JenkinsIcon, description: "" },
      { name: "AWS EC2", icon: EC2Icon, description: "" },
      { name: "AWS RDS", icon: RdsIcon, description: "" },
      { name: "AWS S3", icon: S3Icon, description: "" },
      { name: "CloudFront", icon: CloudFrontIcon, description: "" },
      { name: "Kinesis", icon: KinesisIcon, description: "" },
      { name: "Nginx", icon: NginxIcon, description: "" },
    ],
  },
  expertises_txt: {
    "Architecture / Product": [
      {
        name: "",
        description:
          "REST API · Worker/Queue · Scheduler · 대용량 파일/이미지/영상 처리 · AI Pipeline 통합",
      },
      {
        name: "",
        description:
          "FE/BE/Worker/AI 서비스 연동 · DB/Entity 설계 · 운영 장애 분석 및 성능 개선",
      },
    ],
    "Leadership / Delivery": [
      {
        name: "",
        description:
          "6인 개발팀 리드 · JIRA 2주 Sprint · Git Branch/Coding Convention · Slack/JIRA Automation",
      },
      {
        name: "",
        description:
          "GS/TTA 인증 · 고객사 기술협의 · 서버 구축 · 현장 설치 · 사용자 교육 · 제품 납품",
      },
    ],
    "3rd Party / Commerce": [
      {
        name: "",
        description:
          "Cafe24/Makeshop · NicePay/EXIMBAY · Naver Cloud SMS/Mail · FCM · SNS Login · 배송조회",
      },
    ],
    "Security / OSS": [
      {
        name: "",
        description:
          "OpenSSF Scorecard · SBOM · Grype 취약점 분석 · Jenkins 기반 OSS 검증 자동화",
      },
    ],
  },
  timeline: [
    {
      icon: Academy,
      title: "(주)딥인스펙션 · 개발사업부 / 팀장",
      subtitle: "2024.10 - 현재",
      description:
        "Web 3명·AI 3명 팀 리드. 교량·터널·댐·지하철 애자 등 시설물 AI 안전진단 SaaS DeepInspector의 Backend/Worker 중심 Full-Stack 개발, AI Pipeline 통합, DevOps, GS/TTA 인증 및 고객사 구축·납품 수행.",
      currently: true,
    },
    {
      icon: Academy,
      title: "주식회사 싱커 · 창업 및 개발총괄",
      subtitle: "2021.02 - 2024.09 (프로젝트/법인 기간 포함)",
      description:
        "K-패션 브랜드 룩북 기반 B2B 플랫폼을 창업하여 Vue.js 웹/하이브리드앱, Node.js/TypeScript Backend, 관리자 Back Office, 결제·물류·검색·추천, AWS 인프라와 Jenkins CI/CD까지 제품 전반을 설계·개발·운영.",
    },
    {
      icon: Academy,
      title: "주식회사 인공지능연구원 · 주임연구원",
      subtitle: "2020.01 - 2021.02",
      description:
        "마이데이터 기반 보험 분석 서비스의 Spring Boot Backend와 React Native 고객/설계사 앱 개발. 초기 아이디어·설계 단계부터 서비스 출시까지 참여.",
    },
    {
      icon: Academy,
      title: "에스코어(주) · 오픈소스소프트웨어팀 / L2",
      subtitle: "2015.02 - 2020.01",
      description:
        "삼성 그룹웨어 Knox Portal 관리자 시스템 개발·운영, Spring/Java 마이그레이션 및 AngularJS 성능 개선. Scrapy/Selenium/Elasticsearch 기반 제품 평판 분석·수집 시스템 개발.",
    },
    {
      icon: Academy,
      title: "한국기술교육대학교",
      subtitle: "2008.02 - 2015.02",
      description: "컴퓨터공학부 졸업 (3.59 / 4.5)",
    },
  ],
};

export default author;
