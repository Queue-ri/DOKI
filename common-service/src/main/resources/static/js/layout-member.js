// 예약은 서비스가 분리되어 있어서 API Gateway 없이 테스트 불가 (CORS 터짐)
const API_GATEWAY_HOST = ""

/* 접속중인 사용자 정보 logging */
console.warn("memberRole:", memberRole);
console.warn("memberCode:", memberCode);
console.warn("requestUuid:", requestUuid);

/* 좌측 서비스 로고 버튼 클릭시 작동하는 함수 */
function gotoRoot() {
    location.href = window.location.origin;
}

/* DOM 렌더링 후 실행되어야 하는 로직 */
document.addEventListener("DOMContentLoaded", () => {
    /* 페이지 로딩시마다 알림 내역 가져오는 함수 */
    // 반드시 DOM 렌더링 후 작동해야 함 (안그러면 updateIndicator의 getElementById에서 null 터짐)
//    if (memberCode != null) { // 로그인 상태일때만 가져오기
//        axios.get(API_GATEWAY_HOST + "/noti/all"
//        ).then(function (response) {
//            console.log(response);
//            let notiList = response.data;
//            let notiCount = response.data.length;
//            if (notiCount > 0) {
//                let firstUnreadNoti = notiList[0]; // 가장 오래된 알림을 하나 읽어옴.
//                // 토스트 뷰 처리
//                const data = JSON.parse(firstUnreadNoti.data);
//                showAlarmToast(data);
//                deleteReadAlarm(firstUnreadNoti.notificationId);
//            }
//        }).catch(function (error) {
//            console.log(error);
//            alert("알림을 가져오는데 실패했습니다.");
//        });
//    }


    /* navbar hide animation */
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    let lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // 페이지 로드 시 스크롤 위치 확인
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop === 0) {
        // 맨 위에서 로드: 무조건 show
        navbar.classList.remove('hide');
    } else {
        // 세션 상태를 적용
        const savedState = sessionStorage.getItem('navbar-hide');
        if (savedState === 'true') {
            navbar.classList.add('hide');
        } else {
            navbar.classList.remove('hide');
        }
    }

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

        if (currentScroll > lastScrollTop) {
            // 아래로 스크롤: hide
            navbar.classList.add('hide');
            sessionStorage.setItem('navbar-hide', 'true');
        } else if (currentScroll < lastScrollTop) {
            // 위로 스크롤: show
            navbar.classList.remove('hide');
            sessionStorage.setItem('navbar-hide', 'false');
        }

        lastScrollTop = Math.max(0, currentScroll);
    });
});

// id가 nid인 알림 삭제
async function deleteReadAlarm(nid) {
    await deleteRequest(`${API_GATEWAY_HOST}/noti?id=${nid}`);
    console.log(`${nid}번 알림 삭제 완료`);
}


/*
    검색 컨트롤 함수
        1. search: 검색 API request - 검색 버튼과 연결되어 있음.
        2. keypress event listener: 엔터 입력 시 검색 API request
*/
function search() {
    const keyword = document.getElementById('searchbar-input').value;
    location.href = `${API_GATEWAY_HOST}/search?q=${keyword}`;
}


/* 로그인 함수 */
function signIn() {
    // 로그인 오버레이
    const overlay = document.getElementById('signin-overlay');

    // 로그인 입력 정보
    const memberId = document.getElementById('signin_id').value;
    const memberPw = document.getElementById('signin_pw').value;

    axios.post(`${API_GATEWAY_HOST}/v1/auth/sign-in`, {
        member_id: memberId,
        member_pw: memberPw
    }).then(function (response) {
        console.log(response);
        const role = response.data.memberRole;
        overlay.style.visibility = "hidden";
        if (role === "MEMBER") {
            location.reload();
        } else { // MANAGER, ADMIN
            window.location.replace("/");
        }
    }).catch(function (error) {
        console.log(error);
        if (error.status === 404) alert("아이디 또는 비밀번호가 틀렸습니다.");
        else alert("서버와의 통신에 실패했습니다.");
    });
}

window.onload = () => { // document 렌더링 후 enter key 이벤트 연결
    // 하나의 onload 콜백 함수에 다 몰아서 작성해야 함.
    document.getElementById('searchbar-input').addEventListener('keypress', event => {
        if (event.key === 'Enter') {
            search();
        }
    });
    document.getElementById('signin_id').addEventListener('keypress', event => {
        if (event.key === 'Enter') {
            signIn();
        }
    });
    document.getElementById('signin_pw').addEventListener('keypress', event => {
        if (event.key === 'Enter') {
            signIn();
        }
    });
}

function signOut() {
    const ok = confirm("로그아웃 하시겠습니까?");
    if (ok) {
        axios.delete(`${API_GATEWAY_HOST}/v1/auth/sign-out`
        ).then(function (response) {
            console.log(response);

            // 로그아웃 시 localStorage 초기화
            localStorage.removeItem("lastEventId");

            window.location.replace("/");
        }).catch(function (error) {
            console.log(error);
            alert("서버와의 통신에 실패했습니다.");
        });
    }
}

/* 회원가입 함수 */
function signUp() {
    location.href = `${API_GATEWAY_HOST}/auth/sign-up`;
}

/*
    로그인 오버레이 컨트롤
        1. showOverlay: 오버레이 보여주는 함수
        2. mouseup event listener: 오버레이 숨기는 함수
*/
function showOverlay() {
    // 로그인 오버레이
    // const overlay = document.getElementById('signin-overlay');
    const box = document.getElementById('signin-box');
    box.style.opacity = 0;
    $("#signin-overlay")
        .css("display", "flex")
        .hide()
        .fadeIn('fast');

    setTimeout(() => {
        box.style.opacity = 100;
        $("#signin-box")
            .css("display", "flex")
            .hide()
            .fadeIn(450);
    }, 120);
}

window.addEventListener('mouseup',function(event){
    // 로그인 오버레이
    const overlay = document.getElementById('signin-overlay');

    // signin-box 외부 클릭 시 overlay 숨기기
    if(!(event.target.closest("#signin-box"))){
        $("#signin-overlay").fadeOut(400);
    }
});

/* 로그인 창 입력값 유효성 검사 함수 */
function checkLoginAvailable() {
    const idValue = document.getElementById('signin_id').value;
    const pwValue = document.getElementById('signin_pw').value;
    const button = document.getElementById('signin-button');

    if (idValue.length > 0 && pwValue.length > 0) {
        button.classList.add('active');
        button.onclick = signIn;
    }
    else {
        button.classList.remove('active');
        button.onclick = null;
    }
}

/* '나의 예약' 버튼 클릭시 작동하는 함수 */
function gotoMyReservationPage() {
    if (memberRole !== 'MEMBER') {
        alert("미리보기 모드입니다.");
        return;
    }
    location.href = `${API_GATEWAY_HOST}/member/reserve`;
}


/*
    SSE 알림
*/
if (memberRole === "MEMBER" && memberCode != null) { // 이용자 로그인 상태에서만 SSE 수신
    const lastEventId = localStorage.getItem("lastEventId") || "";
    const eventSource = new EventSource(API_GATEWAY_HOST + `/noti/subscribe?lastEventId=${lastEventId}`);

    // SSE 최초 연결시
    eventSource.onopen = function () {
        console.log('SSE 연결 성공');
        console.log('memberCode:', memberCode);
    };

    // SSE 이벤트 발생시마다 --> custom type 용
    // 이용자는 RESERVE_RESULT type에 대한 이벤트만 수신함.
    eventSource.addEventListener("connect", (event) => {
        // lastEventId 초기화
        localStorage.setItem("lastEventId", event.lastEventId);
    });

    eventSource.addEventListener("RESERVE_RESULT", (event) => {
        // const message = event.data;
        console.log('Received message:', event.data); // logging

        // lastEventId 업데이트
        localStorage.setItem("lastEventId", event.lastEventId);

        // 현재의 URL에 따른 동적 뷰 처리
        if (window.location.href === `${window.location.origin}/member/reserve`) { // 1. 나의 예약 페이지면
            console.log('이벤트 수신 -> 나의 예약 테이블 업데이트');
            updateView();
        }

        // 토스트 뷰 처리
        const data = JSON.parse(event.data);
        showAlarmToast(data);
    });

    // 페이지 unload 시 SSE 연결 종료 (stall 방지)
    window.addEventListener('beforeunload', () => {
        if (eventSource) eventSource.close();
    });

    // 토스트 뷰 컨트롤
    function showAlarmToast(data) {
        console.log('show toast'); // logging
        // parent div (toast box)
        const notiToastBoxDiv = document.getElementById('noti-toast-box');
        switch (data.messageCode) {
            case 'RESERVE_PENDING': default: notiToastBoxDiv.style.border = "1px solid #232323"; break;
            case 'CONFIRMED': notiToastBoxDiv.style.border = "1px solid #134CFF"; break;
            case 'REFUSED': case 'CANCELED': notiToastBoxDiv.style.border = "1px solid #FA6F77"; break;
        }

        // icon box
        const notiToastIconBoxDiv = document.getElementById('noti-toast-icon-box');
        switch (data.messageCode) {
            case 'RESERVE_PENDING': default: notiToastIconBoxDiv.style.backgroundColor = "rgba(35, 35, 35, 0.9)"; break;
            case 'CONFIRMED': notiToastIconBoxDiv.style.backgroundColor = "rgba(19, 76, 255, 0.8)"; break;
            case 'REFUSED': case 'CANCELED': notiToastIconBoxDiv.style.backgroundColor = "rgba(250, 111, 119, 0.9)"; break;
        }

        // icon img
        const iconImg = document.getElementById('noti-toast-icon');
        switch (data.messageCode) {
            case 'REFUSED': case 'CANCELED': iconImg.src = '/icon/layout/calendar_no.svg'; break;
            default: iconImg.src = '/icon/layout/calendar_yes.svg'; break;
        }

        // old div
        const titleDiv = document.getElementById('noti-toast-data-title');
        const messageDiv = document.getElementById('noti-toast-data-message');
        const createdAtDiv = document.getElementById('noti-toast-data-createdAt');

        // new div
        const newTitleDiv = document.createElement("div");
        newTitleDiv.classList.add('noti-toast-data-title');
        newTitleDiv.id = 'noti-toast-data-title';
        newTitleDiv.appendChild(document.createTextNode(data.storeName));

        const newMessageDiv = document.createElement("div");
        newMessageDiv.classList.add('noti-toast-data-message');
        newMessageDiv.id = 'noti-toast-data-message';
        newMessageDiv.appendChild(document.createTextNode(data.message));

        const newCreatedAtDiv = document.createElement("div");
        newCreatedAtDiv.classList.add('noti-toast-data-createdAt');
        newCreatedAtDiv.id = 'noti-toast-data-createdAt';
        newCreatedAtDiv.appendChild(document.createTextNode(data.createdAt));

        // div 교체
        titleDiv.replaceWith(newTitleDiv);
        messageDiv.replaceWith(newMessageDiv);
        createdAtDiv.replaceWith(newCreatedAtDiv);

        // 토스트 박스 보여주기
        notiToastBoxDiv.classList.add("active");

        // 5초 후 토스트 박스 숨기기
        setTimeout(() =>{
            console.log('hide toast'); // logging
            notiToastBoxDiv.classList.remove("active");
        }, 5000)
    }
}


/* axios request */
async function deleteRequest(endpoint) {
    try {
        const response = await axios.delete(endpoint);
        console.log(response);
        return response;
    } catch (error) {
        console.error(error);
        // alert("서버와의 통신에 실패했습니다.");
        throw error;
    }
}