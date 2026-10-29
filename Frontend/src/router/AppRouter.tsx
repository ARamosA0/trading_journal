import { Route, Routes } from "react-router-dom";
import Landing from '../page/Landing'
import Login from '../page/Login'
import Singup from '../page/Singup'
import ForgotPassword from "../page/ForgotPassword";
import ResetPassword from "../page/ResetPassword";
import JournalLayout from '../layouts/JournalLayout'
import Journal from '../page/journal/Journal'
import Profile from '../page/journal/Profile'
import Accounts from "../page/journal/Accounts";
import Dashboard from "../page/journal/Dashboard";
import OpenTrades from "../page/journal/OpenTrades";
import Tools from "../page/journal/Tools";
import RequireAuth from "./RequireAuth";

export default function AppRouter() {
    return (
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Singup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

                <Route element={<RequireAuth/>}>
                    <Route element={<JournalLayout />}>
                        <Route path="/journal" element={<Journal />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/accounts" element={<Accounts />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/opentrades" element={<OpenTrades />} />
                        <Route path="/tools" element={<Tools />} />
                    </Route>
                </Route>
            </Routes>
    )
}
