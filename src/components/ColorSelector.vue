<script>
  import { computed } from 'vue';
  import { useSketchfabStore } from '../stores/sketchfab';

  export default {
    props: {
      colors: Array, // Array of color objects: { name: string, value: [r, g, b], id: string }
    },
    setup() {
      const sketchfabStore = useSketchfabStore();
      const activeColor = computed(() => sketchfabStore.activeColor);

      return {
        activeColor,
      };
    },
    methods: {
      selectColor(color) {
        this.$emit('color-selected', color);
      },
      rgbToHex(rgb) {
        const r = Math.round(rgb[0] * 255);
        const g = Math.round(rgb[1] * 255);
        const b = Math.round(rgb[2] * 255);
        let colorHexString = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

        if (rgb.length > 3) {
          const a = Math.round(rgb[3] * 255);
          colorHexString += a.toString(16).padStart(2, '0');
        }

        return colorHexString;
      },
    },
  };
</script>

<template>
    <div class="color-selector">
      <div
        v-for="color in colors"
        :key="color.id"
        @click="selectColor(color)"
        :class="{ 'active': activeColor && color.id === activeColor.id }"
        class="color-item"
      >
        <div class="color-circle" :style="{ backgroundColor: rgbToHex(color.value) }"></div>
        <div class="color-label">{{ color.name }}</div>
      </div>
    </div>
</template>

<style scoped>
  .color-selector {
    display: flex;
    flex-wrap: wrap;
  }

  .color-item {
    text-align: center;
    cursor: pointer;
    margin: 10px;
  }

  .color-circle {
    width: 64px;
    height: 64px;
    -webkit-transition: all 150ms ease;
    transition: all 150ms ease;
    border: 2px solid transparent;
    border-radius: 50%;
  }

  .color-label {
    margin-top: 5px;
    font-weight: normal;
  }

  .color-item.active .color-circle {
    border: 2px solid #000;
    padding: 5px;
    background-clip: content-box;
  }

  .active .color-label {
    font-weight: bold;
  }
  </style>