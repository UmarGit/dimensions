<template>
  <div
    class="relative z-10"
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true"
    v-show="props.open"
  >
    <div
      class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
    ></div>

    <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
      <div
        class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"
      >
        <div
          class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
        >
          <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div class="">
              <div class="mt-3 text-center sm:mt-0 sm:text-left">
                <h3
                  class="text-base font-semibold leading-6 text-gray-900 mb-4"
                  id="modal-title"
                >
                  Instructions To Play
                </h3>
                <div class="mt-2">
                  <div class="relative overflow-x-auto">
                    <table
                      class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400"
                    >
                      <thead class="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                          <th scope="col" class="px-6 py-3">Key</th>
                          <th scope="col" class="px-6 py-3">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          class="bg-white border-b dark:bg-gray-900 dark:border-gray-700"
                          v-for="item in data"
                          :key="item.key"
                        >
                          <th
                            scope="row"
                            class="px-6 py-4 font-medium text-gray-500 whitespace-nowrap dark:text-gray-400"
                          >
                            <kbd
                              class="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500"
                              >{{ item.key }}</kbd
                            >
                          </th>
                          <td class="px-6 py-4">
                            {{ item.description }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              class="inline-flex w-full justify-center rounded-md bg-[#EAB308] px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto"
              @click="emits('close')"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const props = defineProps<{
  open: boolean;
}>();

const emits = defineEmits<{
  (e: "close"): void;
}>();

const data = ref([
  {
    key: "W",
    description: "Move the character forward",
  },
  {
    key: "S",
    description: "Move the character backward",
  },
  {
    key: "A",
    description: "Move the character left",
  },
  {
    key: "D",
    description: "Move the character right",
  },
  {
    key: "SHIFT",
    description: "Crouch",
  },
  {
    key: "Spacebar",
    description: "Jump",
  },
  {
    key: "Z",
    description: "Full screen 2D view",
  },
]);
</script>
