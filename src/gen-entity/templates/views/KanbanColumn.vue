<script setup lang="ts">
import type { I__Name__ } from "~/entities/__name__/types";
import __Name__KanbanCard from "./__Name__KanbanCard.vue";

defineProps<{
  label: string;
  items: I__Name__[];
}>();

const emit = defineEmits<{
  open: [item: I__Name__];
  create: [];
}>();
</script>

<template>
  <section class="flex h-full max-h-full w-72 shrink-0 flex-col overflow-hidden rounded-2xl bg-slate-50 p-1">
    <header class="my-2 flex shrink-0 items-center gap-2 px-2">
      <h3 class="min-w-0 truncate text-sm font-semibold text-slate-800">
        {{ label }}
      </h3>
      <span
        class="rounded-full bg-slate-200/70 px-2 py-0.5 text-[11px] font-medium tabular-nums text-slate-500"
      >
        {{ items.length }}
      </span>

      <PrimeButton
        class="ml-auto"
        type="button"
        text
        rounded
        size="small"
        icon="pi pi-plus"
        severity="secondary"
        aria-label="Добавить"
        @click="emit('create')"
      />
    </header>

    <div class="it-native-scrollbar-hidden min-h-0 grow overflow-y-auto overflow-x-hidden px-1 pb-2">
      <div class="flex flex-col gap-3">
        <__Name__KanbanCard
          v-for="item in items"
          :key="item.id"
          :item="item"
          @open="emit('open', $event)"
        />

        <p
          v-if="!items.length"
          class="px-2 py-6 text-center text-xs text-slate-400 select-none"
        >
          Нет записей
        </p>
      </div>
    </div>
  </section>
</template>
