<template>
  <div class="space-y-8">
    <div class="grid gap-4 sm:grid-cols-2">
      <article class="rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 class="font-bold text-gray-900">
          MySQL · 트랜잭션과 관계 데이터
        </h3>
        <p class="mt-2 text-sm leading-7 text-gray-600">
          회원·상품·주문·결제·배송의 서비스 데이터와 도메인 간 관계를
          관리합니다. TypeORM Entity를 통해 애플리케이션의 업무 모델과
          연결했습니다.
        </p>
      </article>
      <article class="rounded-2xl border border-gray-200 bg-gray-50 p-5">
        <h3 class="font-bold text-gray-900">
          OpenSearch · 검색과 집계
        </h3>
        <p class="mt-2 text-sm leading-7 text-gray-600">
          상품 검색과 Aggregation을 담당합니다. 거래 및 관계 데이터를 관리하는
          MySQL과 역할을 분리해 검색·통계에 맞는 데이터 조회 구조를
          구성했습니다.
        </p>
      </article>
    </div>

    <div>
      <h3 class="mb-4 text-lg font-bold text-gray-900">
        핵심 DB 관계
      </h3>
      <p class="mb-3 text-sm text-gray-500">
        좌우로 스크롤해 관계를 확인하세요.
      </p>
      <div
        role="region"
        aria-label="핵심 DB 관계 카드"
        tabindex="0"
        class="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-4 focus-visible:outline-2 focus-visible:outline-indigo-600"
      >
        <article
          v-for="relation in relations"
          :key="relation.title"
          class="w-[88%] min-w-0 shrink-0 snap-start rounded-2xl border border-gray-200 p-5 sm:w-[420px]"
        >
          <h4 class="font-bold text-gray-900">
            {{ relation.title }}
          </h4>
          <p class="mt-3 text-sm leading-7 text-gray-600">
            {{ relation.description }}
          </p>
          <ul class="mt-4 space-y-3 text-sm leading-7 text-gray-700">
            <li
              v-for="item in relation.items"
              :key="item"
              class="break-words border-l-2 border-indigo-200 pl-3"
            >
              {{ item }}
            </li>
          </ul>
        </article>
      </div>
    </div>

    <div>
      <h3 class="mb-3 text-lg font-bold text-gray-900">
        도메인별 DB 구조도
      </h3>
      <p class="mb-4 text-sm leading-7 text-gray-600">
        관리자·회원·외부 쇼핑몰 연동부터 주문·공동구매·마케팅까지 9개 영역으로
        나눈 구조도입니다. 이미지를 누르면 원본 크기로 테이블과 연결 관계를
        확인할 수 있습니다.
      </p>
      <HorizontalImageGallery
        :images="diagrams"
        image-directory="images/experience/sild/db"
        label="SILD 도메인별 DB 구조도"
      />
    </div>
  </div>
</template>

<script setup>
const relations = [
  {
    title: "회원정보",
    description:
      "Member를 기준으로 인증·배송지와 구매·리뷰·포인트를 연결하고, 바이어와 라이브 사용자 역할을 확장합니다.",
    items: [
      "인증·배송지: Member → MemberToken / MemberDelivery",
      "서비스 활동: Member → CmallOrder / CmallReview / CmallPoint",
      "Entity 관계 기준: Member ↔ MemberBuyer (1:1), Member ↔ LiveUser (1:1)",
    ],
  },
  {
    title: "상품정보",
    description:
      "Provider의 상품을 CmallItem에 연결하고 상세와 옵션을 분리합니다. 외부 쇼핑몰에서 수집한 상품도 내부 상품 모델에 통합합니다.",
    items: [
      "Provider → CmallItem → CmallItemDetail / CmallItemOption",
      "CmallCategory → CmallItem",
      "CmallItem은 cca_id, cca_id2, cca_id3로 3단계 Category reference를 가질 수 있습니다.",
    ],
  },
  {
    title: "주문 · 브랜드 · 상품 · 결제 · 배송 정보",
    description:
      "회원의 주문을 중심으로 브랜드별 주문 정보, 주문 상품, 결제, 배송과 상태 이력을 나누어 관리합니다.",
    items: [
      "Member → CmallOrder",
      "CmallOrder → CmallOrderProvider / CmallOrderItem",
      "CmallOrder → CmallOrderPay / CmallOrderDelivery / CmallOrderHistory",
    ],
  },
  {
    title: "B2B 공동구매 정보",
    description:
      "브랜드·룩북에서 구성하는 공동구매 상품과 바이어의 참여·주문 수량·배송 내역을 별도 관계로 관리합니다.",
    items: [
      "구매 측: Member → MemberBuyer → CmallGroupBuyingBuyer → CmallGroupBuyingBuyerItem → CmallGroupBuyingBuyerItemDelivered",
      "상품 정의 측: Provider / Lookbook → CmallGroupBuying → ItemGroup → GroupBuyingItem",
      "구조도에서는 구매 상품과 배송 주소를 연결하고 delivered_qty로 배송 수량을 관리합니다.",
    ],
  },
];

const diagrams = [
  {
    image: "01_admin_system.png",
    width: 1717,
    height: 1696,
    alt: "SILD 관리자·메뉴 권한, 배치 작업 및 API·관리자 로그 DB 구조도",
    caption: "관리자·시스템 — 메뉴 권한, 배치와 운영 로그",
  },
  {
    image: "02_member_buyer.png",
    width: 2249,
    height: 1776,
    alt: "회원과 토큰, 바이어 정보·주소·관심상품을 연결한 DB 구조도",
    caption: "회원·바이어 — 인증, 바이어 프로필과 관심상품",
  },
  {
    image: "03_provider_shop_integration.png",
    width: 1492,
    height: 1280,
    alt: "Provider와 AppAuth, Cafe24·메이크샵 상품·카테고리 및 Shop 테이블 구조도",
    caption: "브랜드·외부 쇼핑몰 — 인증과 상품·카테고리 연동",
  },
  {
    image: "04_catalog_learning.png",
    width: 1793,
    height: 1304,
    alt: "상품과 상세·옵션, 3단계 카테고리 참조 및 학습 용어 DB 구조도",
    caption: "상품·분류 — 상품 상세, 옵션, 카테고리와 학습 용어",
  },
  {
    image: "05_order_payment_delivery.png",
    width: 1590,
    height: 2104,
    alt: "회원 주문과 브랜드별 주문·상품·결제·배송·이력을 연결한 DB 구조도",
    caption: "주문·결제·배송 — 주문별 상품과 처리 이력",
  },
  {
    image: "06_group_buying.png",
    width: 2013,
    height: 1550,
    alt: "브랜드·룩북 공동구매 상품과 바이어 참여·주문 상품·배송 주소·배송 수량 DB 구조도",
    caption: "B2B 공동구매 — 상품 구성, 바이어 참여와 배송",
  },
  {
    image: "07_live_review_activity.png",
    width: 1926,
    height: 1937,
    alt: "라이브 사용자·콘텐츠·상품과 회원 리뷰·댓글·포인트 관계 구조도",
    caption: "활동 — 콘텐츠, 리뷰와 포인트 연결",
  },
  {
    image: "08_board_event_inquiry.png",
    width: 1955,
    height: 2424,
    alt: "공지·FAQ·이벤트와 회원·브랜드·주문·바이어 문의 DB 구조도",
    caption: "게시판·문의 — 공지, 이벤트와 서비스 문의",
  },
  {
    image: "09_coupon_marketing.png",
    width: 1481,
    height: 864,
    alt: "브랜드 쿠폰과 사용 로그, Cafe24 쿠폰 시리얼 및 회원 사용 이력 구조도",
    caption: "쿠폰·마케팅 — 쿠폰과 사용 이력, Cafe24 시리얼",
  },
];
</script>
