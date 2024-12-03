import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@mui/material";

const Logout = () => {
    const { logout } = useAuth0();

const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } })
        .then(() => {
            console.log("Logout successful");
        })
        .catch((error) => {
            console.error("Logout failed", error);
        });
};

    return (
        <Button sx={{backgroundColor:"Red"}} onClick={handleLogout}>
            Cerrar sesión
        </Button>
    );
};

export default Logout;
