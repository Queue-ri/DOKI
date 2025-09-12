// 예약은 서비스가 분리되어 있어서 API Gateway 없이 테스트 불가 (CORS 터짐)
const API_GATEWAY_HOST = ""

/* 접속중인 사용자 정보 logging */
console.warn("memberRole:", memberRole);
console.warn("memberCode:", memberCode);
console.warn("requestUuid:", requestUuid);

/* 페이지 로딩시마다 알림 내역 가져오는 함수 */
// 반드시 DOM 렌더링 후 작동해야 함 (안그러면 updateIndicator의 getElementById에서 null 터짐)
document.addEventListener("DOMContentLoaded", () => {
    // localStorage에 notiList가 없으면 최초 로그인 후 첫 로딩으로 간주
    const cachedNotiList = localStorage.getItem("notiList");
    if (!cachedNotiList) {
        console.log('GET /noti/all');
        axios.get(API_GATEWAY_HOST + "/noti/all")
            .then(function (response) {
                console.log(response);
                notiList = response.data;
                localStorage.setItem("notiList", JSON.stringify(notiList)); // cache
                processNoti(notiList);
            })
            .catch(function (error) {
                console.log(error);
                alert("알림을 가져오는데 실패했습니다.");
            });
    }
    else {
        console.log('Access cache');
        // localStorage에서 불러오기
        notiList = JSON.parse(cachedNotiList);
        processNoti(notiList);
    }
});

function processNoti(notiList) {
    notiCount = notiList.length;

    if (notiCount > 0) {
        updateIndicator();
        notiList.forEach(noti => {
            addSingleElementToAlarmList(JSON.parse(noti.data));
        });
    }
}

function signOut() {
    const ok = confirm("로그아웃 하시겠습니까?");
    if (ok) {
        axios.delete(API_GATEWAY_HOST + "/v1/auth/sign-out"
        ).then(function (response) {
            console.log(response);

            // 로그아웃 시 localStorage 초기화
            localStorage.removeItem("notiList");

            window.location.replace("/");
        }).catch(function (error) {
            console.log(error);
            alert("서버와의 통신에 실패했습니다.");
        });
    }
}

function gotoRoot() {
    location.href = window.location.origin;
}

/* sidebar 메뉴 클릭시 페이지 이동하는 용도 */
function gotoPage(idx) {
    switch (idx) {
        case 0: gotoRoot(); break;
        case 1: location.href = API_GATEWAY_HOST; break;
        case 2: location.href = API_GATEWAY_HOST; break;
        case 3: location.href = API_GATEWAY_HOST + "/store/reserve"; break;
        case 4: location.href = API_GATEWAY_HOST; break;
        case 5: location.href = API_GATEWAY_HOST + "/store/reserve/log"; break;
        case 6: location.href = API_GATEWAY_HOST; break;
        case 7: location.href = API_GATEWAY_HOST; break;
        default: alert("잘못된 접근입니다."); break;
    }
}

/* 알림 버튼 클릭시 동작하는 함수 */
function toggleAlertListBox() {
    const div = document.getElementById('navbar-alert-list-box');
    const isOpen = div.classList.toggle('open');

    if (isOpen) {
        // 알림 개수에 따라 가변 max-height 처리
        if (div.children.length === 0) {
            div.style.minHeight = '100px'; // 알림 없으면 최소 100px 펼쳐짐
        }
        else {
            div.style.maxHeight = '350px'; // 알림 있으면 최대 350px 펼쳐짐
        }
        // 알림 리스트가 열렸을 때만 API 호출
        axios.delete(API_GATEWAY_HOST + "/noti/all")
            .then(function (response) {
                console.log(response);
            })
            .catch(function (error) {
                console.log(error);
                alert("서버와의 통신에 실패했습니다.");
            });
    }
    else {
        // 닫힘
        div.style.minHeight = '0';
        div.style.maxHeight = '0';
    }
}


/*
    SSE 알림
*/
let notiCount = 0; // 최초 페이지 로딩 시 초기 알림 개수
const eventSource = new EventSource(API_GATEWAY_HOST + "/noti/subscribe");

// SSE 최초 연결시
eventSource.onopen = function() {
    console.log('SSE 연결 성공');
};

// 페이지 unload 시 SSE 연결 종료 (stall 방지)
window.addEventListener('beforeunload', () => {
    if (eventSource) eventSource.close();
});

// SSE 이벤트 발생시마다 --> 'message' 타입에만 동작하므로, 프로젝트에서 사용하지 않음
// eventSource.onmessage = (event) => {
//     const message = event.data;
//     console.log('Received message:', message); // logging
//
//     // 알림 개수 증가
//     notiCount += 1;
//
//     // 뷰 업데이트
//     const alertBoxDiv = document.getElementById("navbar-alert-box"); // div
//     const bellBoxImg = document.getElementById("navbar-bell-icon"); // img
//
//     alertBoxDiv.innerHTML = `확인하지 않은 알림이 ${notiCount}건 있습니다.`;
//     bellBoxImg.src = "/icon/layout/bell_on_dark.svg";
// };

// SSE 이벤트 발생시마다 --> custom type 용
// 운영자는 RESERVE_REQUEST type에 대한 이벤트만 수신함.
eventSource.addEventListener("RESERVE_REQUEST", (event) => {
    // const message = event.data;
    console.log('Received message:', event.data); // logging

    // 알림 개수 증가
    notiCount += 1;

    // 뷰 업데이트
    // 1. 인디케이터 뷰 업데이트
    updateIndicator();

    // 2. 알림 리스트 뷰에 element 추가
    const data = JSON.parse(event.data);
    addSingleElementToAlarmList(data);

    // 3. 현재의 URL에 따른 동적 뷰 처리
    if (window.location.href === `${window.location.origin}/store/reserve`) { // 1. 예약 승인 / 예약 취소 페이지면
        console.log('이벤트 수신 -> 메트릭 & 예약 테이블 업데이트');
        updateView(); // 메트릭, 테이블 뷰 업데이트
    }
});

function updateIndicator() {
    const alertBoxDiv = document.getElementById("navbar-alert-box"); // div
    const bellBoxImg = document.getElementById("navbar-bell-icon"); // img

    alertBoxDiv.innerHTML = `확인하지 않은 알림이 ${notiCount}건 있습니다.`;
    bellBoxImg.src = "/icon/layout/bell_on_dark.svg";
}

function addSingleElementToAlarmList(data) {
    const alertListBoxDiv = document.getElementById("navbar-alert-list-box");

    const alertElementDiv = document.createElement("div");
    alertElementDiv.classList.add('navbar-alert-element');

    const alertElementContentBoxDiv = document.createElement("div");
    alertElementContentBoxDiv.classList.add('navbar-alert-content-box');

    // alert content
    const alertElementTitleDiv = document.createElement("div");
    alertElementTitleDiv.classList.add('navbar-alert-element-title');
    const formattedDateTime = moment(data.reservedDateTime).format("YYYY-MM-DD HH:mm");
    alertElementTitleDiv.appendChild(document.createTextNode(formattedDateTime));

    const alertElementMessageDiv = document.createElement("div");
    alertElementMessageDiv.classList.add('navbar-alert-element-message');
    alertElementMessageDiv.appendChild(document.createTextNode(data.message));

    const alertElementCreatedAtDiv = document.createElement("div");
    alertElementCreatedAtDiv.classList.add('navbar-alert-element-createdAt');
    alertElementCreatedAtDiv.appendChild(document.createTextNode(data.createdAt));

    // delete button
    const alertDeleteButtonDiv = document.createElement("div");
    alertDeleteButtonDiv.classList.add('navbar-alert-delete-button');
    const deleteImg = document.createElement("img");
    deleteImg.id = "noti-delete";
    deleteImg.src = "/icon/layout/noti_delete.svg";
    alertDeleteButtonDiv.appendChild(deleteImg);

    // append
    alertElementContentBoxDiv.appendChild(alertElementTitleDiv);
    alertElementContentBoxDiv.appendChild(alertElementMessageDiv);
    alertElementContentBoxDiv.appendChild(alertElementCreatedAtDiv);

    alertElementDiv.appendChild(alertElementContentBoxDiv);
    alertElementDiv.appendChild(alertDeleteButtonDiv);

    alertListBoxDiv.appendChild(alertElementDiv);
}