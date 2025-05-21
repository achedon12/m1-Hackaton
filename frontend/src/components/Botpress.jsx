import {Composer, Fab, Header, useWebchat, Configuration, MessageList} from '@botpress/webchat'
import {useMemo, useState} from "react";

function Botpress() {
    const [isWebchatOpen, setIsWebchatOpen] = useState(false)

    const {
        client,
        clientState,
        messages,
        isTyping,
        user,
        newConversation
    } = useWebchat({
        clientId: 'd7b487e3-8fff-4fda-9a7e-17a2b6e48bc1',
    })

    const headerConfig = {
        botName: 'SupportBot',
        botAvatar: 'https://cdn.botpress.cloud/bot-avatar.png',
        botDescription: 'Your virtual assistant for all things support.',

        phone: {
            title: 'Call Support',
            link: 'tel:+1234567890',
        },

        email: {
            title: 'Email Us',
            link: 'mailto:support@example.com',
        },

        website: {
            title: 'Visit our website',
            link: 'https://www.example.com',
        },

        termsOfService: {
            title: 'Terms of Service',
            link: 'https://www.example.com/terms',
        },

        privacyPolicy: {
            title: 'Privacy Policy',
            link: 'https://www.example.com/privacy',
        },
    }

    const config = {
        botName: 'SupportBot',
        botAvatar: 'https://picsum.photos/id/80/400',
        botDescription: 'Your virtual assistant for all things support.',
    }

    const enrichedMessages = useMemo(
        () =>
            messages.map((message) => {
                const { authorId } = message
                const direction = authorId === user?.id ? 'outgoing' : 'incoming'
                return {
                    ...message,
                    direction,
                    sender:
                        direction === 'outgoing'
                            ? { name: user?.name ?? 'You', avatar: user?.pictureUrl }
                            : { name: config.botName ?? 'Bot', avatar: config.botAvatar },
                }
            }),
        [config.botAvatar, config.botName, messages, user?.id, user?.name, user?.pictureUrl]
    )


    return (
        <div>
            <Fab onClick={() => setIsWebchatOpen(!isWebchatOpen)} />
            <Container
                connected={clientState !== 'disconnected'}
                style={{
                    width: '500px',
                    height: '800px',
                    display: isWebchatOpen ? 'flex' : 'none',
                    position: 'fixed',
                    bottom: '90px',
                    right: '20px',
                }}
            >
                <Header
                    onOpenChange={() => console.log('Override the header open change')}
                    defaultOpen={true}
                    closeWindow={() => setIsWebchatOpen(false)}
                    restartConversation={newConversation}
                    disabled={false}
                    configuration={headerConfig}
                />
                <MessageList
                    botAvatar={config.botAvatar}
                    botName={config.botName}
                    botDescription={config.botDescription}
                    isTyping={isTyping}
                    headerMessage="Chat History"
                    showMarquee={true}
                    messages={enrichedMessages}
                    sendMessage={client?.sendMessage}
                />
                <Composer
                    disableComposer={false}
                    isReadOnly={false}
                    allowFileUpload={true}
                    connected={clientState !== 'disconnected'}
                    sendMessage={client?.sendMessage}
                    uploadFile={client?.uploadFile}
                    composerPlaceholder="Type a message..."
                    showPoweredBy={true}
                />
            </Container>
        </div>
    )
}