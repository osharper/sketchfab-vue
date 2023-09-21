<script>
export default {
  props: {
    parts: Array, // Array of part objects from the parent component
    selectedIndex: Number, // Index of the active part from the parent component
  },
  methods: {
    selectPart(index) {
      // Emit an event to notify the parent component of the selected part index
      this.$emit('part-selected', index);
    },
  },
};
</script>

<template>
    <div class="part-selector">
      <!-- Generate part headers from the data array -->
      <div
        v-for="(part, index) in parts"
        :key="index"
        @click="selectPart(index)"
        :class="{ active: selectedIndex === index }"
        class="part"
      >
        <span>{{ part.name }}</span>
      </div>
    </div>
  </template>

<style scoped>
/* Add your styling for tab headers here */
.part-selector {
  display: flex;
  flex: 0 1 80%;
  overflow: auto;
}

.part {
  padding: 10px;
  cursor: pointer;
  text-rendering: optimizelegibility;
  text-transform: uppercase;
  padding: 15px 20px;
  letter-spacing: 0.6px;
  text-align: center;
}

.part span {
  position: relative;
}

.part span:after {
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

.part.active {
  background-color: lightgray;
}

.part.active span:after {
    background-color: #1b1b1b;
    opacity: 1;
}
</style>
