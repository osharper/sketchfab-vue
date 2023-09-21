<script>
import { computed } from 'vue';
import { useSketchfabStore } from '../stores/sketchfab';

export default {
  props: {
    materials: Array, // Array of material objects from the parent component
  },
  methods: {
    selectMaterial(index) {
      // Emit an event to notify the parent component of the selected part index
      this.$emit('material-selected', index);
    },
  },
  setup() {
    const sketchfabStore = useSketchfabStore();
    const activeMaterial = computed(() => sketchfabStore.activeMaterial);

    return {
        activeMaterial,
    };
  },
};
</script>

<template>
    <div class="material-selector">
      <!-- Generate part headers from the data array -->
      <div
        v-for="(material, index) in materials"
        :key="index"
        @click="selectMaterial(index)"
        :class="{ active: activeMaterial && activeMaterial.id === material.id }"
        class="material"
      >
        <span>{{ material.name }}</span>
      </div>
    </div>
  </template>

<style scoped>
/* Add your styling for tab headers here */
.material-selector {
  display: flex;
  flex-direction: column;
  border-right: 1px solid #dddddd;
}

.material {
  cursor: pointer;
  padding: 11px 0 11px 10px;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  display: block;
  min-width: 10em;
  width: fit-content;
}

.material.active {
  background-color: lightgray;
}

.material span {
  position: relative;
}

.material span:after {
    content: "";
    background: transparent;
    height: 1px;
    position: absolute;
    width: 100%;
    left: 0px;
    bottom: -4px;
    opacity: 0;
    will-change: opacity, background-color;
    -webkit-transition: all 200ms cubic-bezier(0.4, 0.0, 0.2, 1);
    transition: all 200ms cubic-bezier(0.4, 0.0, 0.2, 1);
}

.material.active span:after {
    background-color: #1b1b1b;
    opacity: 1;
}
</style>
