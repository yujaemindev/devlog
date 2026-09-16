import JavascriptIcon from "assets/devicon/javascript.svg?component"
import TypescriptIcon from "assets/devicon/typescript.svg?component"
import PythonIcon from "assets/devicon/python.svg?component"
import JavaIcon from "assets/devicon/java.svg?component"
import FlaskIcon from "assets/devicon/flask.svg?component"
import NodeIcon from "assets/devicon/node.svg?component"
import VueIcon from "assets/devicon/vuejs.svg?component"
import HTMLIcon from "assets/devicon/html.svg?component"
import CSSIcon from "assets/devicon/css.svg?component"
import PrimeVueIcon from "assets/devicon/primevue.svg?component"
import ReactNativeIcon from "assets/devicon/reactnative.svg?component"
import AngularJSIcon from "assets/devicon/angularjs.svg?component"
import SpringBootIcon from "assets/devicon/springboot.svg?component"
import JenkinsIcon from "assets/devicon/jenkins.svg?component"
import MariaDBIcon from "assets/devicon/mariadb.svg?component"
import ElasticSearchIcon from "assets/devicon/aws-elasticsearch.svg?component"
import CloudFrontIcon from "assets/devicon/aws-cloudfront.svg?component"
import KinesisIcon from "assets/devicon/aws-kinesis.svg?component"
import LambdaIcon from "assets/devicon/aws-lambda.svg?component"
import RdsIcon from "assets/devicon/aws-rds.svg?component"
import S3Icon from "assets/devicon/aws-s3.svg?component"
import EC2Icon from "assets/devicon/aws-ec2.svg?component"
import DockerIcon from "assets/devicon/docker.svg?component"
import FlutterIcon from "assets/devicon/flutter.svg?component"
import DartIcon from "assets/devicon/dart.svg?component"

// Timeline
import Home from "assets/icons/home.svg?component"
import Academy from "assets/icons/academy.svg?component"

const author = {
    author_image: "/my.jpg",
    name: "유재민",
    position: "Full Stack Developer",
    email: "jaeminy4341@gmail.com",
    location: "Seoul, Korea",
    github: "yujaemin",
    socials: {
        instagram: "https://www.instagram.com/jaeminy4341/",
        twitter: "#",
        stackoverflow: "#",
        youtube: "#",
        linkedin: "https://www.linkedin.com/in/%EC%9E%AC%EB%AF%BC-%EC%9C%A0-705960247/",
        facebook: "#",
    },
    expertises: {
        "Language": [
            {
                name: "Javascript",
                icon: JavascriptIcon,
                description: "",
            },
            {
                name: "Typescript",
                icon: TypescriptIcon,
                description: "",
            },
            {
                name: "Java",
                icon: JavaIcon,
                description: "",
            },
            {
                name: "Python",
                icon: PythonIcon,
                description: "",
            },
            {
                name: "Dart",
                icon: DartIcon,
                description: "",
            },
        ],
        "Frontend": [
            {
                name: "VueJS",
                icon: VueIcon,
                description: "",
            },
            {
                name: "HTML",
                icon: HTMLIcon,
                description: "",
            },
            {
                name: "CSS",
                icon: CSSIcon,
                description: "",
            },
            {
                name: "Flutter",
                icon: FlutterIcon,
                description: "",
            },
            {
                name: "PrimeVue",
                icon: PrimeVueIcon,
                description: "",
            },
            {
                name: "ReactNative",
                icon: ReactNativeIcon,
                description: "",
            },
            {
                name: "AngularJS",
                icon: AngularJSIcon,
                description: "",
            },
        ],
        "Backend": [
            {
                name: "NodeJs",
                icon: NodeIcon,
                description: "",
            },
            {
                name: "MariaDB",
                icon: MariaDBIcon,
                description: "MariaDB",
            },
            {
                name: "SpringBoot",
                icon: SpringBootIcon,
                description: "",
            },
            {
                name: "Flask",
                icon: FlaskIcon,
                description: "",
            },
        ],
        "CI/CD": [
            {
                name: "Jenkins",
                icon: JenkinsIcon,
                description: "",
            },
            {
                name: "Docker",
                icon: DockerIcon,
                description: "",
            },
        ],
        "AWS": [
            {
                name: "EC2",
                icon: EC2Icon,
                description: "",
            },
            {
                name: "S3",
                icon: S3Icon,
                description: "",
            },
            {
                name: "CloudFront",
                icon: CloudFrontIcon,
                description: "",
            },
            {
                name: "OpenSearch",
                icon: ElasticSearchIcon,
                description: "",
            },
            {
                name: "Kinesis",
                icon: KinesisIcon,
                description: "",
            },
            {
                name: "lambda",
                icon: LambdaIcon,
                description: "",
            },
            {
                name: "RDS",
                icon: RdsIcon,
                description: "",
            },
        ],
    },expertises_txt: {
        "그 외 경험": [
            {
                name: "",
                description: "Android/IOS 앱 배포",
            },
            {
                name: "",
                description: "Cafe24 REST API 상품/카테고리 수집",
            },
            {
                name: "",
                description: "NICE PAY 결제 연동",
            },
            {
                name: "",
                description: "NAVER CLOUD SMS 연동",
            },
        ],
    },
    timeline: [
        {
            icon: Academy,
            title: "주식회사 싱커",
            subtitle: "2022.02 - 현재",
            description: "K-Fashion 브랜드 룩북 소개 및 B2B 판매 플랫폼 개발 및 운영",
        },
        {
            icon: Academy,
            title: "주식회사 인공지능연구원",
            subtitle: "2021.02 - 2022.07",
            description: "마이데이터 기반 보험 리모델링 고객앱/설계사앱 및 백엔드 개발, 제품 출시",
        },
        {
            icon: Academy,
            title: "에스코어(주)",
            subtitle: "2015.02 - 2020.01",
            description: "Knox Portal(삼성 그룹웨어) 관리자기능 개발 및 운영, 제품 평판 분석 시스템 개발",
        },
        {
            icon: Academy,
            title: "한국기술대학교",
            subtitle: "2008.02 - 2015.02",
            description: "컴퓨터공학부 졸업(3.59/4.5)",
        },
        {
            icon: Home,
            title: "출생",
            subtitle: "1990.02.23",
            description: "대전에서 태어나서 고등학교까지 졸업",
        },
    ],
}

export default author
