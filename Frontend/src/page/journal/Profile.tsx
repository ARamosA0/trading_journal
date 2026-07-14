import {useState, useEffect, useContext} from 'react';
import { HeaderContext } from "../../hook/HeaderContext"
function Profile() {
    const { setHeader } = useContext(HeaderContext)
    useEffect(() => {
        setHeader({
            title: "Profile",
            subtitle: "Manage your account settings and preferences",
        })
    }, [])
    return (
        <></>
    )
}

export default Profile;