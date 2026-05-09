import { create } from 'zustand';
import { loginEmail } from '../apis/authAPI';

// JWT payload 디코딩 (검증 없이 클레임만 읽기)
const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

const useAuthStore = create((set) => ({
  token: localStorage.getItem('playtap_token') ?? null,
  isLoggedIn: localStorage.getItem('playtap_loggedIn') === 'true',

  login: async ({ email, password }) => {
    const data = await loginEmail({ email, password });

    // 응답 구조에 따라 토큰 필드명이 다를 수 있으므로 콘솔로 전체 확인
    console.log('[login] 응답 전체:', data);

    const token = data.token ?? data.accessToken ?? data.access_token ?? null;
    if (token) {
      const decoded = decodeToken(token);
      console.log('[login] 토큰 디코딩 결과:', decoded);
      console.log('[login] role:', decoded?.role ?? decoded?.roles ?? '없음');
    }

    localStorage.setItem('playtap_token', token ?? '');
    localStorage.setItem('playtap_loggedIn', 'true');
    set({ token, isLoggedIn: true });

    return data;
  },

  logout: () => {
    localStorage.removeItem('playtap_token');
    localStorage.removeItem('playtap_loggedIn');
    set({ token: null, isLoggedIn: false });
  },
}));

export default useAuthStore;
