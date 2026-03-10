"use client"
import { Suspense } from "react"
import VerifyOtp from "../components/verifyOtp"
import Loading from "../components/Loading"
const VerifyPage = () => {

    return (
        <div>
            <Suspense fallback={<Loading/>}>
                <VerifyOtp/>
            </Suspense>
        </div>
    )
}

export default VerifyPage
