<template>
    <div>
      <label :for="id" class="block mb-2 text-sm font-medium">{{ label }}</label>
      <input
        :type="type"
        :name="name"
        :id="id"
        :placeholder="placeholder"
        v-model="internalValue"
        :class="inputClasses"
        class="bg-gray-50 border text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
        :required="required"
      />
    </div>
  </template>
  
  <script lang="ts" setup>
  import { defineProps, defineEmits, computed, ref, watch } from 'vue'
  
  const props = defineProps({
    modelValue: String,
    label: String,
    type: String,
    name: String,
    id: String,
    placeholder: String,
    required: Boolean,
    error: Boolean,
  })
  
  const emits = defineEmits(['update:modelValue'])
  
  // Local state to manage the input value
  const internalValue = ref(props.modelValue)
  
  // Watch for changes in the input value and emit them
  watch(internalValue, (newValue) => {
    emits('update:modelValue', newValue)
  })
  
  watch(() => props.modelValue, (newValue) => {
    internalValue.value = newValue
  })
  
  const inputClasses = computed(() => ({
    'border-gray-300 focus:ring-blue-500 focus:border-blue-500': !props.error,
    'border-red-500 focus:border-red-500 focus:ring-red-500': props.error,
  }))
  </script>