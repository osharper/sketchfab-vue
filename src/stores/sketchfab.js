// store.js
import { toRaw } from 'vue';
import { defineStore } from 'pinia';

export const useSketchfabStore = defineStore('sketchfab', {
  state: () => ({
    api: null,
    config: {
      modelId: '', // Initialize with your Sketchfab URL ID
    },
    options: {}, // Initialize with your default options
    parts: [],
    activePart: null,
    availableMaterials: [],
    activeMaterial: null,
    availableColors: [],
    activeColor: null,
    materializedParts: [],
    materials: [],
    materialsList: [],
    actionsHistory: [],
  }),

  getters: {
    isSketchfabReady: (state) => state.api !== null,
  },

  actions: {
    async initializeSketchfab(iframe, config) { // Accept the iframe as a parameter
      const client = new Sketchfab(iframe);

      try {
        const api = await new Promise((resolve, reject) => {
          client.init(this.config.modelId, {
            ui_infos: 0,
            ui_controls: 0,
            graph_optimizer: 0,
            success: (api) => resolve(api),
            error: () => reject(new Error('Viewer error')),
          });
        });

        api.start();

        await new Promise((resolve) => {
          api.addEventListener('viewerready', resolve);
        });

        this.api = api;

        await this.initializeOptions(config);
        await this.initializeMaterialOptions(config);
      } catch (error) {
        console.error('Error initializing Sketchfab:', error);
      }
    },

    async initializeOptions() {
      return await new Promise((resolve, reject) => {
        this.api.getNodeMap((err, nodes) => {
          if (err) {
              reject(err);
              return;
          }
          var node;
          var isOptionObject = false;
          var keys = Object.keys(nodes);
          for (var i = 0; i < keys.length; i++) {
              node = nodes[keys[i]];
              isOptionObject = (node.type === 'Geometry' || node.type === 'Group');
              if (isOptionObject) {
                  console.log('Found the following node:', node);

                  if (node.materialID) {
                      this.materializedParts.push({ name: node.name, node, materialID: node.materialID });
                  }

                  var part = this.parts.find(p => p.nodes.includes(node.name));
                  if (part) part.nodeIds = part.nodeIds ? part.nodeIds.concat(node.instanceID) : [node.instanceID];
              }
          }
          resolve();
        })
      });
    },

    async initializeMaterialOptions({ materialsList }) {
      this.materialsList = materialsList;

      return await new Promise((resolve, reject) => {
        this.api.getMaterialList((err, materials) => {
          if (err) {
              reject(err);
              return;
          }

          this.materials = materials;

          this.materialsList.forEach(m => {
              if (!m.fromMaterial) return;

              var material = materials.find(material => material.name === m.fromMaterial);
              m.template = JSON.parse(JSON.stringify(material));
              delete m.template.id;
              delete m.template.name;
          });

          resolve();
        });
      });
    },

    selectPart(partIndex) {
        this.activePart = this.parts[partIndex];

        this.availableMaterials = this.activePart.materials.map(m => this.materialsList.find(mat => mat.id === m.id));

        if (this.activePart.selection) {
          this.selectMaterial(this.availableMaterials.findIndex(m => m.id === this.activePart.selection.material));
          this.selectColor(this.availableColors.findIndex(c => c.id === this.activePart.selection.color));
        } else {
          this.selectMaterial(0);
          this.activeColor = null;
        }
    },

    selectMaterial(materialIndex) {
        var part = this.activePart;
        this.activeMaterial = this.availableMaterials[materialIndex];

        var partMaterialColors = part.materials.find(m => m.id === this.activeMaterial.id).colors;

        this.availableColors = partMaterialColors
          ? partMaterialColors.map(c => this.activeMaterial.colors.find(clr => clr.id === c))
          : this.activeMaterial.colors;
    },

    selectColor(color) {
        this.activeColor = color;

        this.setPartSelection(this.activePart.id, this.activeMaterial.id, this.activeColor.id);

        this.actionsHistory.push({ part: this.activePart.id, material: this.activeMaterial.id, color: this.activeColor.id });
    },

    setPartSelection(partId, materialId, colorId) {
      const selection = {
        material: this.activeMaterial.id,
        color: this.activeColor.id,
      };

      if (this.activePart && this.activePart.id === partId) {
        this.activePart.selection = selection
      }

      var part = this.parts.find(p => p.id === partId);
      part.selection = selection;
      part.nodes.forEach(node => this.changeMaterial(node, materialId, colorId));
    },

    resetActivePartSelection() {
      this.resetPart(this.activePart.id);

      this.actionsHistory.push({ part: this.activePart.id, material: 'default' });
    },

    async resetPart(partId) {
      if (this.activePart && this.activePart.id === partId) {
        this.activePart.selection = undefined;
        this.selectMaterial(0);
        this.activeColor = null;
      }

      var part = this.parts.find(p => p.id === partId);
      part.selection = undefined;

      for (var i = 0; i < part.nodes.length; i++) {
        await this.setDefaultMaterial(part.nodes[i]);
      }

      await new Promise((resolve, reject) => this.api.getCameraLookAt(
        (err, { position: p, target }) => err
          ? reject(err)
          : this.api.setCameraLookAt([p[0], p[1], p[2] + 0.01], target, 0.3, err => err ? reject(err) : resolve())
      ));
    },

    async changeMaterial(partId, textureId, colorId) {
      var texture = this.materialsList.find(function (material) {
          return material.id.toLowerCase() === textureId.toLowerCase();
      });

      if (!texture) {
          console.error('Texture not found', textureId);
          return;
      }

      var color = texture.colors.find(function (color) {
          return color.id.toLowerCase() === colorId.toLowerCase();
      });

      if (!color) {
          console.error('Color not found', colorId);
          return;
      }


      var part = this.materializedParts.find(function (p) {
          return p.name === partId;
      });

      if (!part) {
          console.error('Part not found', partId);
          return;
      }

      var material = this.materials.find(function (material) {
          return material.id === part.materialID;
      });

      if (!material) {
          console.error('Material not found', part.materialID);
          return;
      }

      var copy = JSON.parse(JSON.stringify(texture.template));
      copy.name = part.name + '_' + textureId + '_' + colorId;

      copy.channels.AlbedoPBR.color = toRaw(color.AlbedoPBR || color.value);
      copy.channels.DiffuseColor.color = toRaw(color.DiffuseColor || color.value);
      copy.channels.SpecularColor.color = toRaw(color.SpecularColor || color.value);
      copy.channels.DiffusePBR.color = toRaw(color.DiffusePBR || color.value);
      // for (var key in texture.textures) {
      //     copy.channels[key] = {
      //         "enable": true,
      //         "factor": 1,
      //         "flipY": true,
      //         "UVTransforms": {
      //             "scale": [1, 1],
      //             "offset": [0, 0],
      //             "rotation": 0
      //         },
      //         "texture": {
      //             "magFilter": "LINEAR",
      //             "minFilter": "LINEAR_MIPMAP_LINEAR",
      //             "wrapS": "REPEAT",
      //             "wrapT": "REPEAT",
      //             "textureTarget": "TEXTURE_2D",
      //             "internalFormat": "RGB",
      //             "uid": texture.textures[key].uid,
      //         }
      //     };
      // }

      return new Promise((resolve, reject) => this.api.createMaterial(
        copy,
        (err, newMaterial) => {
          if (err) {
              reject(err);
              return;
          }
          this.materials.push(newMaterial);
          this.api.assignMaterial(toRaw(part.node), newMaterial.id);
          resolve(newMaterial);
        }
      ));
    },

    setDefaultMaterial: function setDefaultMaterial(partId) {
      var part = this.materializedParts.find((p) => p.name === partId);

      return new Promise(
        (resolve, reject) => this.api.assignMaterial(
          toRaw(part.node),
          toRaw(part.materialID),
          (err) => err ? reject(err) : resolve(),
        ),
      );
    },

    removePart(partId, omitHistory = false) {
      var index = this.parts.findIndex(p => p.id === partId);

      if (index === -1) return;

      for (var j = 0; j < this.parts[index].nodeIds.length; j++) {
        this.api.hide(this.parts[index].nodeIds[j]);
      }

      this.parts[index].removed = true;

      if (!omitHistory) this.actionsHistory.push({ part: this.activePart.id, removed: true });
    },

    restorePart(partId, omitHistory = false) {
      var index = this.parts.findIndex(p => p.id === partId);

      if (index === -1) return;

      for (var j = 0; j < this.parts[index].nodeIds.length; j++) {
        this.api.show(this.parts[index].nodeIds[j]);
      }

      this.parts[index].removed = false;

      if (!omitHistory) this.actionsHistory.push({ part: this.activePart.id, removed: false });
    },

    getCustomizationDescription() {
      const descriptions = this.parts.map(part => {
        if (!part.selection && !part.removed) return;

        return `${part.name}: ${part.removed ? 'removed' : (part.selection.material + ' - ' + part.selection.color)}`;
      }).filter(Boolean);

      return descriptions.join(', ');
    },

    undoAction() {
      const lastAction = this.actionsHistory.pop();

      if (!lastAction) return;

      if (lastAction.removed !== undefined) {
        lastAction.removed ? this.restorePart(lastAction.part, true) : this.removePart(lastAction.part, true);
        return;
      }

      const prevAction = this.actionsHistory.findLast(a => a.part === lastAction.part);
      if (!prevAction || prevAction.material === 'default') this.resetPart(lastAction.part);
      else this.setPartSelection(prevAction.part, prevAction.material, prevAction.color);
    }
  },
});
