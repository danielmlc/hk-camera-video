<template>
    <div class="main-page">
        <div id="camera-wrap"/>
    </div>
</template>
<script>
import flvjs from 'flv.js'
export default {
    data () {
        return {
            player:{},
        }
    },
    methods: {
        getUrlParams() {
            const params = location.search.split('?')[1]
            let result = {}
            if(params){
                let paramsArr = params.split('&')
                paramsArr.map((item)=>{
                   let code = item.split('=')
                   if(code[0] === 'ipLists') {
                       result.ipLists = code[1].split('|')
                   } else {
                       result[code[0]] = code[1]
                   }
                })
            }
            return result
        },
        loadLists(){
            let wrap = document.getElementById('camera-wrap')
            let urlParams = this.getUrlParams()
            if (urlParams && urlParams.ipLists) {
                for (let i = 0; i < urlParams.ipLists.length; i++) {
                    let dom = `<div class="camera-item"><video class="camera-video" id="vdo-box-${i}" muted autoplay></video></div>`
                    wrap.innerHTML += dom
                    let url = `${location.origin}/live/get?ip=${urlParams.ipLists[i]}&user=${urlParams.user}&pwd=${urlParams.pwd}`
                    setTimeout(() => {
                        this.loadFlv(i, url)
                    }, 500 * (i + 1));
                }
            }
        },
        loadFlv(index, url) {
            if (flvjs.isSupported()) {
                let video = document.getElementById('vdo-box-' + index)
                if (video) {
                    this.player['p' + index] = flvjs.createPlayer({
                        type: "flv",
                        isLive: true,
                        url: url,
                        hasAudio: false,
                    },{
                        enableStashBuffer:false, // 启用缓存
                        autoCleanupSourceBuffer:true, // 自动清理缓存
                        stashInitialSize:128,
                        lazyLoad:false, //懒加载
                        isLive: true,
                        lazyLoadMaxDuration: 0,
                        lazyLoadRecoverDuration: 0,
                        deferLoadAfterSourceOpen: false,
                        fixAudioTimestampGap: false,
                    });
                    this.player['p' + index].attachMediaElement(video);
                    try {
                        this.player['p' + index].load();
                    } catch (error) {
                        console.log(error);
                    };
                    setInterval(() => {
                        if (!video.buffered.length) {
                            return;
                        }
                        let end = video.buffered.end(0);
                        let diff = end - video.currentTime;
                        if (diff >= 0.5) {
                            video.currentTime = end - 0.1 ;
                        }
                    },  1000);

                }
            }
        }
    },
    mounted() {
        this.loadLists()
    }
}
</script>
<style lang="postcss" >
.main-page {
    height: 100%;
    width: 100%;
    #camera-wrap {
        
    }
}
</style>