
import { createContext, useContext, useEffect, useState } from 'react'
import axiosInstance from '~/lib/axios'


// Define the context type
type AuthContextType = {
    user: any | null
    setUser: React.Dispatch<React.SetStateAction<any | null>>
}
const AuthContext = createContext<AuthContextType | null>(null)


export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)

    const fetchUser = async () => {
        try {
            const { data } = await axiosInstance.get('/auth/me')
            
            setUser(data)
        } catch (err) {
            setUser(null)
        }
    }

    useEffect(() => {
        fetchUser()
    }, [])

    return <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}