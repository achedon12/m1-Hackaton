import {Fab, Webchat} from '@botpress/webchat'
import {useState} from "react";

const Botpress = () => {
    const [isWebchatOpen, setIsWebchatOpen] = useState(false)

    const toggleWebchat = () => {
        setIsWebchatOpen((prevState) => !prevState)
    }

    return (
        <>
            <Webchat
                clientId="d7b487e3-8fff-4fda-9a7e-17a2b6e48bc1"
                style={{
                    width: '400px',
                    height: '600px',
                    display: isWebchatOpen ? 'flex' : 'none',
                    position: 'fixed',
                    bottom: '90px',
                    right: '20px',
                }}
                configuration={{

                }}
            />
            <Fab onClick={() => toggleWebchat()} style={{ position: 'fixed', bottom: '20px', right: '20px' }} />
        </>
    )
}

export default Botpress;