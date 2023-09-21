<template>
    <div class="checkbox-switch" @click="toggleCheckbox">
      <input type="checkbox" v-model="internalValue" class="checkbox-switch-input" />
      <div class="checkbox-switch-slider"></div>
    </div>
</template>

<script>
  export default {
    props: {
      value: Boolean,
    },
    emits: ['value-updated'],
    computed: {
      internalValue: {
        get() {
          return this.value;
        },
        set(value) {
          this.$emit('value-updated', value);
        }
      }
    }
  };
</script>

<style scoped>
  .checkbox-switch {
    position: relative;
    width: 60px;
    height: 30px;
    background-color: #c7c7c7;
    border-radius: 15px;
    cursor: pointer;
    overflow: hidden;
  }

  .checkbox-switch-input {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    z-index: 2;
    cursor: pointer;
  }

  .checkbox-switch-slider {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 26px;
    height: 26px;
    background-color: white;
    border-radius: 50%;
    transition: transform 0.2s ease-in-out;
  }

  .checkbox-switch-input:checked + .checkbox-switch-slider {
    transform: translateX(30px);
  }
</style>