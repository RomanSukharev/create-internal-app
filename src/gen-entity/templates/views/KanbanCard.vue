<script setup lang="ts">
import type { I__Name__ } from "~/entities/__name__/types";

const props = defineProps<{
  item: I__Name__;
}>();

const emit = defineEmits<{
  open: [item: I__Name__];
}>();

const plainDescription = computed(() =>
  (props.item.description ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim(),
);
</script>

<template>
  <button
    type="button"
    class="w-full rounded-2xl bg-white p-3.5 text-left shadow-sm transition hover:shadow-md"
    @click="emit('open', item)"
  >
    <p class="line-clamp-2 text-sm font-semibold text-slate-900">
      {{ item.title }}
    </p>
    <p
      v-if="plainDescription"
      class="mt-2 line-clamp-2 text-xs text-slate-500"
    >
      {{ plainDescription }}
    </p>
  </button>
</template>
