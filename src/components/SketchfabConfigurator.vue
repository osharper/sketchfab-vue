<script>
import { computed, onMounted, ref } from 'vue';
import { useSketchfabStore } from '../stores/sketchfab';
import PartSelector from './PartSelector.vue';
import PartConfigurator from './PartConfigurator.vue';

export default {
  components: {
    PartSelector,
    PartConfigurator
  },
  props: {
    modelid: {
      type: String,
      required: true,
    },
    config: {
      type: Object,
      default: () => ({}),
    },
  },
  setup({ modelid, config }) {
    const sketchfabStore = useSketchfabStore();

    sketchfabStore.config.modelId = modelid;
    sketchfabStore.parts = config.parts;

    // declare a ref to hold the element reference
    // the name must match template ref value
    const sketchfabIframe = ref(null);

    const parts = computed(() => sketchfabStore.parts);
    const activePart = computed(() => sketchfabStore.activePart);
    const activePartIndex = computed(() => sketchfabStore.parts.indexOf(sketchfabStore.activePart));

    const isSketchfabReady = computed(() => sketchfabStore.isSketchfabReady);

    const hasHistory = computed(() => sketchfabStore.actionsHistory.length > 0);

    onMounted(() => {
      sketchfabStore.initializeSketchfab(sketchfabIframe.value, config)
        .then(() => sketchfabStore.selectPart(0));
    });

    return {
      isSketchfabReady,
      iframeWrapperClass: computed(() => ({
        'sketchfab-ready': isSketchfabReady.value,
      })),
      sketchfabIframe,
      parts,
      hasHistory,
      activePart,
      activePartIndex,
    };
  },
  methods: {
    selectPart(index) {
      useSketchfabStore().selectPart(index);
    },
    undoAction(index) {
      useSketchfabStore().undoAction(index);
    },
  },
};
</script>


<template>
  <div class="top-selector">
    <PartSelector :parts="parts" :selected-index="activePartIndex" @part-selected="selectPart" />
    <div v-if="hasHistory" class="toolbar">
      <button @click="undoAction()">Undo</button>
    </div>
  </div>

  <div class="main-row">
    <div :class="iframeWrapperClass" class="sketchfab-vue-wrapper">
      <!-- Use the ref attribute to give the element a name -->
      <iframe ref="sketchfabIframe"></iframe>
    </div>

    <PartConfigurator :part="activePart" />
  </div>
</template>


<style scoped>

.top-selector {
  border-top: 1px solid #dddddd;
  border-bottom: 1px solid #dddddd;
  display: flex;
  flex-direction: row;
}

.top-selector .toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1em;
  flex: 0 0 20%;
  border-left: 1px solid #dddddd;
  margin-left: auto;
}

.toolbar button {
  padding: 0.5em 1em;
  border-radius: 0.5em;
  border: 1px solid #dddddd;
  background: #ffffff;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  font-size: 0.8em;
  font-weight: bold;
  color: #333333;
  transition: all 0.2s ease-in-out;
  margin: 0 0 0 auto;
}


.main-row {
  flex: 1 0 auto;
  display: flex;
  height: 100%;
}

.sketchfab-vue-wrapper {
    position: relative;
    flex: 1 1 auto;
    background: #ccc;
    overflow: hidden;
}

.sketchfab-vue-wrapper iframe {
    display: block;
    position: absolute;
    left: 0;
    top: -48px;
    width: 100%;
    height: calc(100% + 108px);
    border: 0;
}
</style>
