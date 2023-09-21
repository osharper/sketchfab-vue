<script>
import { computed } from 'vue';
import { useSketchfabStore } from '../stores/sketchfab';

import ColorSelector from './ColorSelector.vue';
import MaterialSelector from './MaterialSelector.vue';
import CheckboxSwitch from './CheckboxSwitch.vue';

export default {
  components: {
    ColorSelector,
    MaterialSelector,
    CheckboxSwitch,
},
  props: {
    part: {
      type: Object,
      default: () => ({}),
    },
  },
  setup() {
    const sketchfabStore = useSketchfabStore();

    const availableMaterials = computed(() => sketchfabStore.availableMaterials);
    const availableColors = computed(() => sketchfabStore.availableColors);
    const customizationDescription = computed(() => sketchfabStore.getCustomizationDescription());

    return {
        availableMaterials,
        availableColors,
        customizationDescription,
    };
  },
  methods: {
    selectColor(index) {
      useSketchfabStore().selectColor(index);
    },

    selectMaterial(index) {
      useSketchfabStore().selectMaterial(index);
    },
    removePart(doRemove) {
      if (doRemove) useSketchfabStore().removePart(this.part.id);
      else useSketchfabStore().restorePart(this.part.id);
    },
  },
};
</script>


<template>
    <div class="sidebar">
        <div v-if="part && part.removable" class="sidebar-top">
            <label>Remove:</label><CheckboxSwitch :value="part.removed" @value-updated="removePart" />
        </div>
        <div class="part-config" v-if="part && !part.removed">
            <MaterialSelector :materials="availableMaterials" @material-selected="selectMaterial" />
            <ColorSelector :colors="availableColors" @color-selected="selectColor" />
        </div>
        <div v-if="customizationDescription" class="sidebar-bottom">
            <h3>Customization desription:</h3>
            <p>{{ customizationDescription }}</p>
        </div>
    </div>
</template>


<style scoped>
.sidebar-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1em;
    border-bottom: 1px solid #dddddd;
}
.sidebar .part-config {
    display: flex;
    flex-direction: row;
    flex: 1 0 auto;
    max-height: calc(100% - 6rem);
}

.sidebar-bottom {
  padding: 0.5rem;
  border-top: 1px solid #dddddd;
  margin-top: auto;
  height: 10rem;
  max-height: 20%;
}

.sidebar-bottom p {
  text-overflow: ellipsis;
}

.sidebar {
    overflow: auto;
    display: flex;
    position: relative;
    flex-direction: column;
    flex: 0 0 20%;
    padding-left: 0.1em;
}

@media (min-width: 1024px) {
  .sidebar {
    padding-left: 0.1em;
  }
}
</style>
