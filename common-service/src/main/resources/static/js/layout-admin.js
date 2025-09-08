// 예약은 서비스가 분리되어 있어서 API Gateway 없이 테스트 불가 (CORS 터짐)
const API_GATEWAY_HOST = ""

/* 접속중인 사용자 정보 logging */
console.warn("memberRole:", memberRole);
console.warn("memberCode:", memberCode);
console.warn("requestUuid:", requestUuid);

function gotoRoot() {
    location.href = window.location.origin;
}

/* sidebar 메뉴 클릭시 페이지 이동하는 용도 */
function gotoPage(idx) {
    switch (idx) {
        case 0: gotoRoot(); break;
        case 1: location.href = API_GATEWAY_HOST; break;
        case 2: location.href = API_GATEWAY_HOST; break;
        case 3: location.href = API_GATEWAY_HOST; break;
        case 4: location.href = API_GATEWAY_HOST; break;
        default: alert("잘못된 접근입니다."); break;
    }
}

function signOut() {
    const ok = confirm("로그아웃 하시겠습니까?");
    if (ok) {
        axios.delete(API_GATEWAY_HOST + "/v1/auth/sign-out"
        ).then(function (response) {
            console.log(response);
            window.location.replace("/");
        }).catch(function (error) {
            console.log(error);
            alert("서버와의 통신에 실패했습니다.");
        });
    }
}