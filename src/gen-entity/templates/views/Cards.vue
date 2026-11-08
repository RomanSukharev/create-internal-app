<script setup lang="ts">
import { __Name__CardsWrapper } from "~/entities/__name__";
import type { I__Name__ } from "~/entities/__name__/types";
import __Name__Form from "./__Name__Form.vue";

const { open } = useDrawer();

function openForm(id: string) {
  open(__Name__Form, { id });
}
</script>

<template>
  <__Name__CardsWrapper
    v-slot="{
      items,
      isSelected,
      toggleOne,
    }"
  >
    <div class="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="item in (items as I__Name__[])"
        :key="item.id"
        class="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4"
      >
        <div class="flex items-start gap-2">
          <PrimeCheckbox
            binary
            :model-value="isSelected(item.id)"
            class="mt-0.5 shrink-0"
            @update:model-value="(checked) => toggleOne(item.id, checked)"
          />
          <div class="min-w-0 grow">
            <p class="text-sm font-semibold text-slate-900">
              {{ item.title }}
            </p>
            <p
              v-if="item.description"
              class="mt-1 line-clamp-3 text-xs text-slate-500"
            >
              {{ item.description }}
            </p>
          </div>
          <PrimeButton
            text
            rounded
            size="small"
            icon="pi pi-pencil"
            @click="openForm(item.id)"
          />
        </div>
      </div>
    </div>
  </__Name__CardsWrapper>
</template>
