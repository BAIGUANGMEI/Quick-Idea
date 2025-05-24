<script setup>
import { reactive, ref, onMounted, onUnmounted } from 'vue';
import NoteDetail from './NoteDetail.vue';

const navigator_type = ref('saved');
const showSetting = ref(false);
const data = reactive({ noteList: [] });
const detailId = ref(null)
const homeTheme = ref('light') // 新增



const showDetail = (id) => {
    detailId.value = id
}
const closeDetail = () => {
    detailId.value = null
}

const openLink = () => {
    ipcRenderer.invokeWithData('openLink', 'https://github.com/BAIGUANGMEI');
}

const changeNavigator = (type) => {
    navigator_type.value = type;
    getNoteslist();
};

const showSettingModal = () => {
    showSetting.value = !showSetting.value;
};

const changeTheme = async (e) => {
    homeTheme.value = e.target.value // 更新主题

    let theme = await ipcRenderer.invokeWithData('changeTheme', homeTheme.value);

    if (theme == 'light') {
        document.documentElement.classList.remove('dark');
    }else if (theme == 'dark') {
        document.documentElement.classList.add('dark');
    }
};

const getNoteslist = async () => {
    let notes = await ipcRenderer.invokeWithData('getNotes', navigator_type.value);

    data.noteList = notes;

};

const deleteNote = async (id) => {
    await ipcRenderer.invokeWithData('deleteNote', id);
    getNoteslist();
};

const handleDetailClose = () => {
    detailId.value = null
    getNoteslist()
}

// 初次加载
onMounted(() => {

    getNoteslist();
    window.addEventListener('focus', getNoteslist);
});
onUnmounted(() => {
    window.removeEventListener('focus', getNoteslist);
});
</script>

<template>

    <div class="main-container">
        <div class="home-content" v-if="detailId === null">

            <div class="head-navigator">
                <div class="navigator">
                    <div class="navigator-item" :class="{ active : navigator_type === 'saved' }" @click="changeNavigator('saved')">
                        <span class="navigator-text" >Saved</span>
                    </div>
                    <!-- <div class="navigator-item" :class="{ active : navigator_type === 'stared' }" @click="changeNavigator(2)">
                        <span class="navigator-text" >Stared</span>
                    </div> -->
                    <div class="navigator-item" :class="{ active : navigator_type === 'trash' }" @click="changeNavigator('trash')">
                        <span class="navigator-text" >Trash</span>
                    </div>
                </div>
            </div>
            
            <div class="home-content-body">
                <div class="note">
                    <div class="note-item" v-for="(item, index) in data.noteList" :key="index" @click="showDetail(item.id)">
                        <div class="note-title">
                            {{ item.content }}
                        </div>
                        <div class="note-date">
                            {{ item.date }}
                        </div>
                        <div class="note-icon">
                            <img class="note-icon-delete" src="/delete.png" alt="note" @click.stop.prevent="deleteNote(item.id)"/>
                        </div>
                    </div>
                </div>
            </div>

            <div class="home-content-footer">
                <div class="setting">
                    <img class="setting-icon" src="/setting.png" alt="setting" @click="showSettingModal()" />
                </div>

                <div class="setting-modal" :class="{ 'setting-modal-show' : showSetting }">
                    <div class="setting-modal-content">
                        <div class="setting-item">
                            <span class="setting-item-title">Theme :</span>
                            <select class="setting-item-select" v-model="homeTheme" @change="changeTheme($event)" >
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                            </select>
                        </div>
                        <div class="setting-item">
                            <span class="setting-item-title">Language :</span>
                            <span class="setting-item-text">English</span>
                        </div>
                        <div class="setting-item">
                            <span class="setting-item-title">Author :</span>
                            <span class="setting-item-text" style="cursor:pointer;color:#409EFF;" @click="openLink()">BAIGUANGMEI</span>
                        </div>
                        <div class="setting-item">
                            <span class="setting-item-title">Version :</span>
                            <span class="setting-item-text">1.0.0</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div  v-if="detailId !== null" class="slide" >

            <div class="head-navigator">
                <div class="navigator">
                    <div class="navigator-item" :class="{ active : navigator_type === 'saved' }" @click="changeNavigator('saved')">
                        <span class="navigator-text" >Saved</span>
                    </div>
                    <!-- <div class="navigator-item" :class="{ active : navigator_type === 'stared' }" @click="changeNavigator(2)">
                        <span class="navigator-text" >Stared</span>
                    </div> -->
                    <div class="navigator-item" :class="{ active : navigator_type === 'trash' }" @click="changeNavigator('trash')">
                        <span class="navigator-text" >Trash</span>
                    </div>
                </div>
            </div>

            <NoteDetail :id="detailId" @close="handleDetailClose"/>
            <span class="close-btn" @click="closeDetail()" >×</span>
        </div>
    </div>

</template>

<style scoped>
.main-container {
    height: 100%;
    background-color: var(--background-color);
    padding:50px 20px 20px 20px;
}

.home-content {
    position: relative;
    height: 100%;
    background-color: var(--home-content-background-color);
    border-radius: 0px 0px 10px 10px;
    display: flex;
    flex-direction: column;
}

.head-navigator {
    position: absolute;
    top: -30px;
    left: 0;
}

.navigator {
    display: flex;
    justify-content: space-around;
    align-items: center;
}

.navigator-item {
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px;
    background-color: var(--nav-background-color);
    border-radius: 6px 6px 0px 0px;
    transition: all 0.3s ease-in-out;
    cursor: pointer;
}

.navigator-item.active {
    background-color: var(--nav-background-color-active);
}

.navigator-item:hover {
    background-color: var(--nav-background-color-hover);
}

.navigator-text {
    color: var(--text-color);
    text-decoration: none;
    font-size: 14px;
    font-weight: bold;
}

.home-content-body {
    min-height: 0;
    flex: 1; 
    overflow: auto;
    margin-bottom: 50px;
}

.note {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    padding: 10px 10px 0px 16px;
    gap: 10px;
}

.note-item {
    width: 100%;
    height: 80px;
    background-color: var(--note-background-color);
    border-radius: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    transition: all 0.3s ease-in-out;
    cursor: pointer;
}

.note-item:hover {
    background-color: var(--note-background-color-hover);
}

.note-title {
    font-size: 20px;
    font-weight: bold;
    color: var(--text-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 200px;
}

.note-date {
    font-size: 20px;
    font-weight: bold;
    color: var(--text-date-color);
    white-space: nowrap;
}

.note-icon {
    width: 50px;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.note-icon-delete {
    width: 25px;
    height: 25px;
    cursor: pointer;
    transition: all 0.5s ease-in-out;
}


.slide {
    position: relative;
    height: 100%;
    background-color: var(--note-detail-background-color);
    border-radius: 0px 0px 10px 10px;
    display: flex;
    flex-direction: column;
}


.close-btn {
  position: absolute;
  right: 20px;
  font-size: 30px;
  color: #888;
  cursor: pointer;
  z-index: 11;
}

.home-content-footer{
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 50px;
    border-radius: 0px 0px 10px 10px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
}

.setting {
    width: 50px;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.setting-icon {
    width: 30px;
    height: 30px;
    cursor: pointer;
    transition: all 0.5s ease-in-out;
    z-index: 2;
}

.setting-icon:hover {
    transform: rotate(180deg);
}

.setting-modal {
    position: absolute;
    top: -145px;
    right: 0;
    width: 250px;
    height: 190px;
    background-color: var(--modal-background-color);
    display: flex;
    justify-content: center;
    align-items: center; 
    border-radius: 10px;
    opacity: 0;
    transition: all 0.5s ease-in-out;
    z-index: -1;
}

.setting-modal-show {
    z-index: 1;
    opacity: 1;
    transition: all 0.5s ease-in-out;
}

.setting-modal-content {
    width: 100%;
    height: 200px;
    background-color: var(--modal-background-color);
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    padding: 10px 0px 30px 0px;
}

.setting-item {
    width: 100%;
    height: 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
}

.setting-item-title {
    font-size: 16px;
    font-weight: bold;
    color: var(--text-color);
}

.setting-item-select {
    width: 100px;
    height: 30px;
    background-color: var(--select-background-color);
    border-radius: 10px;
    border: none;
    color: var(--text-color);
    font-size: 16px;
    font-weight: bold;
    padding: 0 10px;
}

.setting-item-text {
    font-size: 16px;
    font-weight: bold;
    color: var(--text-color);
}


</style>