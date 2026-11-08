<script setup lang="ts">
import use__Name__ from "../composables/use__Name__";
import type { I__Name__ } from "../types";

const {
  items,
  currentPage,
  itemsPerPage,
  isLoading,
  total,
  delete__Names__,
} = use__Name__();

const pageIds = computed(() => (items.value ?? []).map((item) => item.id));

const {
  selectedIds,
  isBulkDeleting,
  allPageSelected,
  somePageSelected,
  isSelected,
  toggleOne,
  toggleAll,
  clearSelection,
  runBulkDelete,
} = useListBulkSelection(pageIds);

async function onBulkDelete() {
  try {
    await runBulkDelete(delete__Names__);
  } catch {
    // notification already shown
  }
}

defineExpose({
  items,
  isLoading,
});
</script>

<template>
  <ITListPanel
    :is-loading="isLoading"
    :is-empty="!(items?.length ?? 0)"
    empty-message="Записи не найдены"
  >
    <div
      v-if="items?.length"
      class="sticky top-0 z-[1] flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-2.5"
    >
      <PrimeCheckbox
        binary
        :model-value="allPageSelected"
        :indeterminate="somePageSelected"
        @update:model-value="toggleAll"
      />
      <span class="text-xs text-slate-500">Выбрать все</span>
    </div>

    <slot
      :items="(items ?? []) as I__Name__[]"
      :is-loading="isLoading"
      :is-selected="isSelected"
      :toggle-one="toggleOne"
    />

    <template #footer>
      <ITListBulkActions
        :selected-count="selectedIds?.length ?? 0"
        :is-deleting="isBulkDeleting"
        @clear="clearSelection"
        @delete="onBulkDelete"
      />

      <ITListPaginator
        v-model:page="currentPage"
        v-model:rows="itemsPerPage"
        :total-records="total"
      />
    </template>
  </ITListPanel>
</template>
