<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  id: Number
})
const emit = defineEmits(['close'])

const note = ref(null)
const noteContent = ref('')
const noteDate = ref('')
const noteId = ref('')

const getNoteDetail = async () => {
    note.value = await ipcRenderer.invokeWithData('getNoteById', props.id)
    noteId.value = note.value.id
    noteContent.value = note.value.content
    noteDate.value = note.value.date
}

const updateNote = async () => {
    await ipcRenderer.invokeWithData('updateNote', noteId.value, noteContent.value)
    emit('close')
}

onMounted(() => {
  getNoteDetail()
})

</script>

<template>
  <div class="note-detail">
    <div class="date-bar">
        {{ noteDate }}
    </div>
    
    <textarea v-model="noteContent"></textarea>
    <div class="actions-bar">
        <div class="actions">
            <button class="btn" @click="updateNote()">Update</button>
        </div>
    </div>
  </div>
</template>

<style scoped>

.note-detail{
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.date-bar {
    width: 100%;
    height: 50px;
    background: var(--home-content-background-color);
    display: flex;
    align-items: center;
    justify-content: center;
    padding-left: 10px;
    font-size: 20px;
    font-weight: bold;
    color: var(--text-color);
}

.actions-bar {
    width: 100%;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.actions {
    display: flex;
    gap: 20px;
}

.btn {
    background: var(--home-content-background-color);
    border: none;
    color: var(--text-color);
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
    border-radius: 4px;
}


textarea {
    flex: 1;
    width: 100%;
    border: none;
    outline: none;
    resize: none;
    padding: 20px;
    font-size: 16px;
    background-color: var(--note-detail-background-color);
    border-radius: 4px;
    color: var(--text-color);
}
</style>