// 예약은 서비스가 분리되어 있어서 API Gateway 없이 테스트 불가 (CORS 터짐)
const API_GATEWAY_HOST = ""

/* 접속중인 사용자 정보 logging */
console.warn("memberRole:", memberRole);
console.warn("memberCode:", memberCode);
console.warn("requestUuid:", requestUuid);

let notiCount = 0; // 최초 페이지 로딩 시 초기 알림 개수

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
                notiList = [];

                response.data.forEach(noti => {
                    // data만 push: API 스펙을 수정할지는 고민중임
                    // 각 noti 객체의 data는 이미 문자열이므로 객체로 파싱해서 캐싱해야 함
                    notiList.push(JSON.parse(noti.data));
                });

                localStorage.setItem("notiList", JSON.stringify(notiList)); // cache
                notiCount = notiList.filter(noti => noti.status === "UNREAD").length;
                localStorage.setItem("notiCount", notiCount); // cache
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
        const notiList = JSON.parse(cachedNotiList);
        notiCount = parseInt(localStorage.getItem("notiCount"));
        processNoti(notiList);
    }
});

function processNoti(notiList) {
    // notiCount가 0이어도 READ 상태의 알림을 렌더링해야 함에 유의
    updateIndicator();
    notiList.forEach(noti => {
        addSingleElementToAlarmList(noti); // append
    });
}

function signOut() {
    const ok = confirm("로그아웃 하시겠습니까?");
    if (ok) {
        axios.delete(API_GATEWAY_HOST + "/v1/auth/sign-out"
        ).then(function (response) {
            console.log(response);

            // 로그아웃 시 localStorage 초기화
            localStorage.removeItem("notiList");
            localStorage.removeItem("notiCount");
            localStorage.removeItem("lastEventId");

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
//        axios.delete(API_GATEWAY_HOST + "/noti/all")
//            .then(function (response) {
//                console.log(response);
//            })
//            .catch(function (error) {
//                console.log(error);
//                alert("서버와의 통신에 실패했습니다.");
//            });
    }
    else {
        // 닫힘
        div.style.minHeight = '0';
        div.style.maxHeight = '0';
    }
}

// id가 nid인 알림 읽음 처리
function markAsRead(nid) {
    axios.patch(API_GATEWAY_HOST + `/noti/read?id=${nid}`)
    .then(function (response) {
        let notiList = JSON.parse(localStorage.getItem('notiList'));
        notiList = notiList.map(noti => {
            if (noti.notificationId === nid) {
                return { ...noti, status: "READ" }; // status 업데이트
            }
            return noti;
        });
        localStorage.setItem('notiList', JSON.stringify(notiList));

        updateNotiCount(); // 알림 개수 감소
        updateIndicator();

        console.log(`${nid}번 알림 READ 처리 완료`);
    })
    .catch(function (error) {
        console.log(error);
        alert("알림 읽음 처리 중 오류가 발생했습니다.");
    });
}

// id가 nid인 알림 삭제 처리
function markAsDeleted(nid) {
    axios.delete(API_GATEWAY_HOST + `/noti?id=${nid}`)
    .then(function (response) {
        let notiList = JSON.parse(localStorage.getItem('notiList'));
        notiList = notiList.filter(noti => noti.notificationId !== nid);
        localStorage.setItem('notiList', JSON.stringify(notiList));

        updateNotiCount(); // 알림 개수 감소
        updateIndicator();

        console.log(`${nid}번 알림 DELETED 처리 완료`);
    })
    .catch(function (error) {
        console.log(error);
        alert("알림 삭제 처리 중 오류가 발생했습니다.");
    });
}


/*
    SSE 알림
*/
function connectSSE() {
    const lastEventId = localStorage.getItem("lastEventId") || "";
    const eventSource = new EventSource(API_GATEWAY_HOST + `/noti/subscribe?lastEventId=${lastEventId}`);

    // SSE 최초 연결시
    eventSource.onopen = function() {
        console.log('SSE 연결 성공');
    };

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
    eventSource.addEventListener("connect", (event) => {
        // lastEventId 초기화
        localStorage.setItem("lastEventId", event.lastEventId);
    });

    eventSource.addEventListener("RESERVE_REQUEST", (event) => {
        // const message = event.data;
        console.log('Received message:', event.data); // logging

        // localStorage에 저장된 notiList 불러오기
        let cachedNotiList = localStorage.getItem("notiList");
        let notiList = cachedNotiList ? JSON.parse(cachedNotiList) : [];

        // 새로운 알림 추가 후 저장
        const parsedEventData = JSON.parse(event.data);
        notiList.unshift(parsedEventData);
        localStorage.setItem("notiList", JSON.stringify(notiList));

        // lastEventId 업데이트
        localStorage.setItem("lastEventId", event.lastEventId);

        // 알림 개수 증가
        updateNotiCount();

        // 뷰 업데이트
        // 1. 인디케이터 뷰 업데이트
        updateIndicator();

        // 2. 알림 리스트 뷰에 element 추가
        addSingleElementToAlarmList(parsedEventData, true); // prepend

        // 3. 현재의 URL에 따른 동적 뷰 처리
        if (window.location.href === `${window.location.origin}/store/reserve`) { // 1. 예약 승인 / 예약 취소 페이지면
            console.log('이벤트 수신 -> 메트릭 & 예약 테이블 업데이트');
            updateView(); // 메트릭, 테이블 뷰 업데이트
        }
    });

    // SSE 오류 처리 및 재연결
    eventSource.onerror = () => {
        console.log('SSE 오류 발생, 재연결 시도');
        eventSource.close();
        setTimeout(connectSSE, 1000); // 1초 후 재연결
    };

    // 페이지 unload 시 SSE 연결 종료 (stall 방지)
    window.addEventListener('beforeunload', () => {
        if (eventSource) eventSource.close();
    });
}

connectSSE(); // 최초 연결 호출

function updateNotiCount() {
    let notiList = JSON.parse(localStorage.getItem('notiList')) || [];
    notiCount = notiList.filter(noti => noti.status === "UNREAD").length;
    localStorage.setItem("notiCount", notiCount);
}

function updateIndicator() {
    const alertBoxDiv = document.getElementById("navbar-alert-box"); // div
    const bellBoxImg = document.getElementById("navbar-bell-icon"); // img

    if (notiCount > 0) {
        alertBoxDiv.innerHTML = `확인하지 않은 알림이 ${notiCount}건 있습니다.`;
    }
    else {
        alertBoxDiv.innerHTML = "새로운 알림이 없습니다.";
    }
    bellBoxImg.src = "/icon/layout/bell_on_dark.svg";
}

function addSingleElementToAlarmList(data, reverse = false) {
    const alertListBoxDiv = document.getElementById("navbar-alert-list-box");

    const alertElementDiv = document.createElement("div");
    alertElementDiv.classList.add('navbar-alert-element');

    // 읽음 상태면 read 클래스 추가
    if (data.status === "READ") {
        alertElementDiv.classList.add("read");
    }

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

    // 리스트에 추가: 옵션에 따라 prepend 또는 append
    if (reverse) {
        alertListBoxDiv.prepend(alertElementDiv);
    }
    else {
        alertListBoxDiv.appendChild(alertElementDiv);
    }

    /* 알림 클릭 시 동작 */
    // 알림 클릭 시 READ 처리
    alertElementContentBoxDiv.addEventListener("click", async () => {
        try {
            markAsRead(data.notificationId);

            // 캐시 동기화
            let notiList = JSON.parse(localStorage.getItem('notiList'));
            notiList = notiList.map(noti => {
                if (noti.notificationId === data.notificationId) {
                    return { ...noti, status: "READ" }; // 상태 업데이트
                }
                return noti;
            });
            localStorage.setItem('notiList', JSON.stringify(notiList));

            // DOM 업데이트
            alertElementDiv.classList.add("read");
        } catch (err) {
            console.error("알림 읽음 처리 실패:", err);
        }
    });

    // 삭제 버튼 클릭 시 DELETED 처리
    alertDeleteButtonDiv.addEventListener("click", async (event) => {
        event.stopPropagation(); // 상위 클릭 이벤트 막기
        try {
            markAsDeleted(data.notificationId);

            // 캐시에서 제거
            let notiList = JSON.parse(localStorage.getItem('notiList'));
            notiList = notiList.filter(noti => noti.notificationId !== data.notificationId);
            localStorage.setItem('notiList', JSON.stringify(notiList));

            // DOM에서 제거
            alertElementDiv.remove();
        } catch (err) {
            console.error("알림 삭제 처리 실패:", err);
        }
    });
}