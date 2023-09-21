import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import ColorSelector from '../ColorSelector.vue'

// init store
import { createTestingPinia } from '@pinia/testing'

describe('ColorSelector', () => {
  it('renders properly', () => {
    const wrapper = mount(ColorSelector);
    expect(wrapper.html()).toMatchSnapshot();
  })

  it('renders a list of colors', () => {
    const pinia = createTestingPinia();

    const wrapper = mount(ColorSelector, {
      props: { colors: [
        { id: 'red', value: [1, 0, 0], name: 'Red' },
        { id: 'green', value: [0, 1, 0], name: 'Green' },
        { id: 'blue', value: [0, 0, 1], name: 'Blue' },
      ] },
      global: { plugins: [pinia] },
    });
    expect(wrapper.findAll('li')).toHaveLength(3);
  })

  it('emits color-selected on click', async () => {
    const pinia = createTestingPinia();
    const wrapper = mount(ColorSelector, {
      props: { colors: [
        { id: 'red', value: [1, 0, 0], name: 'Red' },
        { id: 'green', value: [0, 1, 0], name: 'Green' },
        { id: 'blue', value: [0, 0, 1], name: 'Blue' },
      ] },
      global: { plugins: [pinia] },
    });

    await wrapper.find('li:nth-child(1)').trigger('click');
    expect(wrapper.emitted()).toHaveProperty('color-selected');
    expect(wrapper.emitted()['color-selected'][0]).toEqual([{ id: 'red', value: [1, 0, 0], name: 'Red' }]);
  })

  it('adds a class to an element with active color', async () => {
    const pinia = createTestingPinia({
      initialState: {
        sketchfab: { activeColor: { id: 'green' } }, // start the counter at 20 instead of 0
      },
    });
    const wrapper = mount(ColorSelector, {
      props: { colors: [
        { id: 'red', value: [1, 0, 0], name: 'Red' },
        { id: 'green', value: [0, 1, 0], name: 'Green' },
        { id: 'blue', value: [0, 0, 1], name: 'Blue' },
      ] },
      global: { plugins: [pinia] },
    });

    expect(wrapper.find('li:nth-child(2)').classes()).toContain('active');
  })
})
