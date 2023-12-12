import React from 'react';
import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
} from '@nextui-org/react';

export default function ModalPopUp(props) {
    return (
        <>
            <Modal isOpen={props.isOpen} onOpenChange={props.onOpenChange}>
                <ModalContent>
                    {onClose => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                Result of submission
                            </ModalHeader>
                            <ModalBody>
                                <p>{props.message}</p>
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    color="danger"
                                    onPress={onClose}
                                    variant="light"
                                >
                                    Close
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}
