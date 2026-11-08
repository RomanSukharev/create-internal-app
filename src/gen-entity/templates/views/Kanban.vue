<script setup lang="ts">
import { use__Name__ } from "~/entities/__name__";
import type { I__Name__ } from "~/entities/__name__/types";
import { ExampleStatusEnum } from "~/shared/api/enums";
import __Name__Form from "./__Name__Form.vue";
import __Name__KanbanColumn from "./__Name__KanbanColumn.vue";

const { open } = useDrawer();
const { items, isLoading } = use__Name__();
const { exampleStatusesList } = useEnumLabels();

const statusOrder = Object.values(ExampleStatusEnum);

const columns = computed(() => {
  const buckets = new Map<ExampleStatusEnum, I__Name__[]>();

  for (const status of statusOrder) {
    buckets.set(status, []);
  }

  for (const item of items.value ?? []) {
    buckets.get(item.status)?.push(item);
  }

  return statusOrder.map((status) => ({
    status,
    label: exampleStatusesList.value[status] ?? status,
    items: buckets.get(status) ?? [],
  }));
});

function openItem(item: I__Name__) {
  open(__Name__Form, { id: item.id });
}

function createInColumn(status: ExampleStatusEnum) {
  open(__Name__Form, { status });
}
</script>

<template>
  <div class="relative h-full min-h-0">
    <div
      v-if="isLoading"
      class="absolute inset-0 z-10 flex items-center justify-center bg-white/50"
    >
      <PrimeProgressSpinner
        style="width: 2rem; height: 2rem"
        stroke-width="4"
      />
    </div>

    <div class="flex h-full gap-3 overflow-x-auto p-1">
      <__Name__KanbanColumn
        v-for="column in columns"
        :key="column.status"
        :label="column.label"
        :items="column.items"
        @open="openItem"
        @create="createInColumn(column.status)"
      />
    </div>
  </div>
</template>
