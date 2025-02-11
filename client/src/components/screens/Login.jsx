import React from "React";
import login from "../../assets/login.jpg"
const LoginPage = () => {
    return (
        <div className="w-screen h-screen flex flex-col">
            {/* Image section */}
            <div className="lg:w-1/2 h-screen">
                <img src={login} alt="login" className="w-full h-full"/>
            </div>
            {/* Form section */}
            <div className="lg:w-1/2 h-screen">

            </div>           
        </div>
    )
}


export default LoginPage;