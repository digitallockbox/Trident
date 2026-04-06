export const authService = {
    login: (email) => ({
        authenticated: true,
        email,
        token: "placeholder-token"
    }),

    logout: () => ({
        authenticated: false
    }),

    session: () => ({
        authenticated: false
    })
};
