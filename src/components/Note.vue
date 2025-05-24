<script setup>
import { ref, onMounted } from 'vue'

const noteContent = ref('')

const Theme = ref('light')

const saveNote = async () => {
    await ipcRenderer.invokeWithData('saveNote', noteContent.value, 'saved')
    window.close();
};

const trashNote = async () => {
    await ipcRenderer.invokeWithData('saveNote', noteContent.value, 'trash')
    window.close();
};

const closeNote = () => {
    window.close();
};

onMounted(() => {
    ipcRenderer.invoke('getTheme').then((theme) => {
        Theme.value = theme
        if (theme === 'dark') {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    })
})

</script>

<template>
  <div class="editor-window">
    

    <div class="drag-bar"></div>
    
    <div class="editor-content">
        <span class="close-btn" @click="closeNote()">×</span>
        <textarea v-model="noteContent" placeholder="Write your idea here..."></textarea>
    </div>
    <div class="actions-bar">
        <div class="actions">
                <button class="btn btn-save" @click="saveNote()">Save</button>
                <button class="btn btn-trash" @click="trashNote()">Trash</button>
        </div>
    </div>
  </div>
</template>

<style scoped>
.editor-window {
    width: 100%;
    height: 100%;
    display: flex;
    background-color: var(--note-background-color);
    flex-direction: column;
}



.drag-bar {
    width: 100%;
    height: 30px;
    -webkit-app-region: drag; /* 让此区域可拖动 */
    background: var(--note-background-color-hover);
    cursor: move;
}

.editor-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 10px;
    position: relative;
}

.close-btn {
    position: absolute;
    top: -40px;
    right: 10px;
    font-size: 32px;
    color: var(--text-color);
    cursor: pointer;
    z-index: 999;
    -webkit-app-region: no-drag;
}

textarea {
    flex: 1;
    width: 100%;
    border: none;
    outline: none;
    resize: none;
    padding: 10px;
    font-size: 16px;
    background-color: var(--note-detail-background-color);
    border-radius: 4px;
    color: var(--text-color);
}

.actions-bar {
    height: 30px;
    background-color: var(--note-background-color-hover);
    border-top: 1px solid var(--text-date-color);
    transition: height 0.3s ease;
}

.actions-bar:hover {
    height: 50px;
}

.actions {
    height: 100%;
    display: flex;
    justify-content: space-between;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.actions-bar:hover .actions {
    opacity: 1;
}
    
.btn {
    padding: 10px;
    border: none;
    cursor: pointer;
}

.btn-save {
    width: 50%;
    background-color: #4CAF50;
    color: white;
    border-radius: 4px 0 0 4px;
    transition: all 0.3s ease;
}

.btn-save:hover {
    width: 100%;
    background-color: #45a049;
}

.btn-trash {
    width: 50%;
    background-color: #f44336;
    color: white;
    transition: all 0.3s ease;
    border-radius: 0 4px 4px 0;
}

.btn-trash:hover {
    width: 100%;
    background-color: #e53935;
}

</style>