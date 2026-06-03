import {useEffect, useState} from "react";
import {useAuth} from "./components/stores/AuthStore.ts";
import LoadingSpinner from "./components/main/LoadingSpinner.tsx";
import AppRouter from "./components/main/routing/AppRouter.tsx";
import {BrowserRouter} from "react-router-dom";

function App() {
  const [isLoading, setIsLoading] = useState(true);

  const {
    checkUser,
    logoutUser
  } = useAuth()

  useEffect(() => {
    checkUser().then((resp) => {
      if (!resp.ok) {
        logoutUser().then(() => {

        })
      }
    })
        .finally(() => {
          setIsLoading(false);
        })
  }, [checkUser, logoutUser])

  if (isLoading) {
    return (
        <LoadingSpinner />
    )
  }

  return (
      <BrowserRouter>
        <AppRouter/>
      </BrowserRouter>
  )
}

export default App
