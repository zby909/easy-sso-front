<template>
  <div class="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 transform">
    <div class="relative w-[1200px] overflow-hidden px-12">
      <div class="relative float-left w-[600px] overflow-hidden">
        <img class="w-full" src="@/assets/404_images/404.png" alt="404" />
        <img class="animate-cloud-left absolute top-[17px] left-[220px] w-20 opacity-0" src="@/assets/404_images/404_cloud.png" alt="404" />
        <img class="animate-cloud-mid absolute top-[10px] left-[420px] w-[46px] opacity-0" src="@/assets/404_images/404_cloud.png" alt="404" />
        <img class="animate-cloud-right absolute top-[100px] left-[500px] w-[62px] opacity-0" src="@/assets/404_images/404_cloud.png" alt="404" />
      </div>
      <div class="relative float-left w-[300px] overflow-hidden py-8">
        <div class="animate-slide-up mb-5 text-[32px] leading-10 font-bold text-blue-500 opacity-0">OOPS!</div>
        <div class="animate-slide-up-1 mb-2.5 text-xl leading-6 font-bold text-gray-800 opacity-0">{{ message }}</div>
        <div class="animate-slide-up-2 mb-8 text-[13px] leading-[21px] text-gray-500 opacity-0">
          Please check that the URL you entered is correct, or click the button below to return to the previous page.
        </div>
        <a
          class="animate-slide-up-3 float-left block h-9 w-[110px] cursor-pointer rounded-full bg-blue-500 text-center text-sm leading-9 text-white opacity-0"
          @click="back"
        >
          Back
        </a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'Page404',
  computed: {
    message() {
      return 'The webmaster said that you can not enter this page...';
    },
  },
  methods: {
    back() {
      if (this.$route.query.noGoBack) {
        this.$router.push({ path: '/' });
      } else {
        this.$router.go(-1);
      }
    },
  },
};
</script>

<style scoped>
@keyframes cloudLeft {
  0% {
    top: 17px;
    left: 220px;
    opacity: 0;
  }
  20% {
    top: 33px;
    left: 188px;
    opacity: 1;
  }
  80% {
    top: 81px;
    left: 92px;
    opacity: 1;
  }
  100% {
    top: 97px;
    left: 60px;
    opacity: 0;
  }
}

@keyframes cloudMid {
  0% {
    top: 10px;
    left: 420px;
    opacity: 0;
  }
  20% {
    top: 40px;
    left: 360px;
    opacity: 1;
  }
  70% {
    top: 130px;
    left: 180px;
    opacity: 1;
  }
  100% {
    top: 160px;
    left: 120px;
    opacity: 0;
  }
}

@keyframes cloudRight {
  0% {
    top: 100px;
    left: 500px;
    opacity: 0;
  }
  20% {
    top: 120px;
    left: 460px;
    opacity: 1;
  }
  80% {
    top: 180px;
    left: 340px;
    opacity: 1;
  }
  100% {
    top: 200px;
    left: 300px;
    opacity: 0;
  }
}

@keyframes slideUp {
  0% {
    transform: translateY(60px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-cloud-left {
  animation: cloudLeft 2s linear forwards 1s;
}

.animate-cloud-mid {
  animation: cloudMid 2s linear forwards 1.2s;
}

.animate-cloud-right {
  animation: cloudRight 2s linear forwards 1s;
}

.animate-slide-up {
  animation: slideUp 0.5s forwards;
}

.animate-slide-up-1 {
  animation: slideUp 0.5s forwards 0.1s;
}

.animate-slide-up-2 {
  animation: slideUp 0.5s forwards 0.2s;
}

.animate-slide-up-3 {
  animation: slideUp 0.5s forwards 0.3s;
}
</style>
