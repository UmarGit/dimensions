<script setup lang="ts">
import { ref } from "vue";
import ControllerSVG from "@/components/ControllerSVG.vue";
import InstructionsDialog from "@/components/InstructionsDialog.vue";
import GameEngine from "@/engine/GameEngine";

const ViewerWindow3D = ref<HTMLElement | null>(null);
const ViewerWindow2D = ref<HTMLElement | null>(null);

const GameEngineInstance = ref<GameEngine | null>(null);

const isGameStarted = ref(false);
const openInstrcutionsModal = ref(false);

const onStartGameHandler = () => {
  isGameStarted.value = true;

  setTimeout(() => {
    onLoadGameHandler();
  }, 1000);
};

const onLoadGameHandler = () => {
  const window3D = ViewerWindow3D.value;
  const window2D = ViewerWindow2D.value;

  if (!window3D || !window2D) {
    return;
  }

  GameEngineInstance.value = new GameEngine(window3D, window2D);
  GameEngineInstance.value.enableControls();

  document.addEventListener("keydown", (event) => {
    if (!GameEngineInstance.value) {
      return;
    }

    switch (event.key) {
      case "z":
        const parent = window2D.parentElement?.parentElement;

        if (parent) {
          parent.classList.add("resizing");

          parent.classList.toggle("focus-in");

          setTimeout(() => {
            parent.classList.remove("resizing");
          }, 500);
        }
        break;
    }
  });

  window.addEventListener("resize", () => {
    if (GameEngineInstance.value) {
      GameEngineInstance.value.resize3DView();
      GameEngineInstance.value.resize2DView();
    }
  });

  const resizeObserver = new ResizeObserver(() => {
    if (GameEngineInstance.value) {
      GameEngineInstance.value.resize2DView();
    }
  });

  resizeObserver.observe(window2D);
};
</script>

<template>
  <main class="dimensions-game">
    <div v-show="isGameStarted">
      <div
        class="game-3d-viewer loader"
        ref="ViewerWindow3D"
        :active="isGameStarted"
      ></div>
    </div>
    <div
      :class="{
        'game-2d-viewer': true,
        started: isGameStarted,
        starting: !isGameStarted,
      }"
    >
      <div
        class="flex items-center flex-col drop-shadow-2xl mb-10"
        v-show="!isGameStarted"
      >
        <div class="bg-neutral-800 p-4 rounded-[28px]">
          <div
            class="title rounded-[18px] text-8xl text-yellow-500 px-6 py-2 bg-yellow-100"
          >
            Dimensions
          </div>
        </div>
        <div
          class="bg-neutral-800 px-6 rounded-[12px] rounded-ss-none rounded-se-none"
        >
          <div class="subtitle text-xl text-white text-center mb-2">
            A 3D + 2D game to test your skills and reflexes
          </div>
        </div>
      </div>

      <div class="controller">
        <ControllerSVG />

        <div
          class="controller-screen loader"
          ref="ViewerWindow2D"
          :active="isGameStarted"
        ></div>

        <div class="welcome-screen" v-show="!isGameStarted">
          <div
            class="welcome-screen-content flex gap-2 items-center justify-center w-full h-full bg-yellow-100"
          >
            <button
              class="text-md text-white cursor-pointer px-6 py-2 rounded-full shadow-xl bg-yellow-500"
              @click="onStartGameHandler"
            >
              Start Game
            </button>

            <button
              class="text-md text-white cursor-pointer px-6 py-2 rounded-full shadow-xl bg-yellow-500"
              @click="openInstrcutionsModal = !openInstrcutionsModal"
            >
              Instructions
            </button>
          </div>
        </div>
      </div>
    </div>

    <InstructionsDialog
      :open="openInstrcutionsModal"
      @close="openInstrcutionsModal = false"
    ></InstructionsDialog>
  </main>
</template>

<style lang="css" scoped>
.dimensions-game {
  background-image: url("/assets/images/hero.jpg");
  background-size: cover;

  @apply relative w-screen h-screen overflow-hidden flex place-content-center place-items-center bg-white;
}

.game-3d-viewer {
  @apply w-screen h-screen cursor-grab;
}

.loader::before {
  content: "";
  @apply absolute top-0 left-0 right-0 bottom-0 bg-white;
}
.loader[active="true"]::before {
  animation: fadeout 0.5s 2s ease-in-out forwards;
}
@keyframes fadeout {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

.game-2d-viewer.started {
  @apply absolute;
  transition: max-width 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

.game-2d-viewer.started {
  @apply w-full max-w-[800px] bottom-10 left-0 right-0 mx-auto z-10 px-[4vw];
}

.game-2d-viewer {
  perspective: 800px;
  transition: all 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

.game-2d-viewer.starting .controller {
  @apply relative w-full h-full filter drop-shadow-lg;
  transform: rotate3d(0.5, -0.866, 0, 20deg) rotate(-1deg);
}

.game-2d-viewer .controller {
  transform: rotate3d(0, 0, 0, 0) rotate(0);
  transition: all 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

.game-2d-viewer.focus-in {
  @apply max-w-[calc(90vw)];
}

.game-2d-viewer .controller :is(.controller-screen, .welcome-screen) {
  @apply absolute top-0 bottom-0 left-0 right-0 m-auto z-10 h-[71%] w-[56%];
}
</style>
