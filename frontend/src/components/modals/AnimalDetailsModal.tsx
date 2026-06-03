import 'react';
import {CloseButton, Col, Container, Image, Modal, Row} from "react-bootstrap";
import type {Animal} from "../../api/animal.ts";
import {GetImageUrl} from "../utils/imageHelper.ts";
import {useEffect, useState} from "react";
import {type Fact, getFactsByAnimalId} from "../../api/fact.ts";
import {type Coloring, getColoringsByBreedId} from "../../api/coloring.ts";

type AnimalDetailsModalProps = {
    onHide: () => void;
    show: boolean;
    animal: Animal;
}

const AnimalDetailsModal = ({onHide, show, animal}: AnimalDetailsModalProps) => {
    const [animalFacts, setAnimalFacts] = useState<Fact[]>([]);
    const [animalColorings, setAnimalColorings] = useState<Coloring[]>([]);

    const handleClose = () => {
        onHide()
    }

    useEffect(() => {
        if (animal.id && show) {
            getFactsByAnimalId(animal.id).then((resp) => {
                if (!resp.ok) {
                    return
                }

                if (resp?.data?.data) {
                    setAnimalFacts(resp.data.data)
                }
            })

            getColoringsByBreedId(animal.breed_id).then((resp) => {
                if (!resp.ok) {
                    return
                }

                if (resp?.data?.data) {
                    setAnimalColorings(resp.data.data);
                }
            })
        }
    }, [animal.id, animal.breed_id, show]);

    return (
        <>
            <Modal
                size={"xl"}
                centered={true}
                aria-hidden={true}
                backdrop="static"
                enforceFocus={false}
                onHide={onHide}
                show={show}
                className={"details-modal"}
            >
                <Modal.Header>
                    <h3>
                        {
                            animal.name
                        }
                    </h3>

                    <CloseButton
                        onClick={handleClose}
                    />
                </Modal.Header>
                <Modal.Body>
                    <Container>
                        <Row>
                            <Col md={6}>
                                <Image src={GetImageUrl(animal.image_link)} alt={animal.image_link}/>
                            </Col>
                            <Col md={6}>
                                <div>
                                    <strong>Наименование</strong>: {animal.name}
                                </div>

                                <div>
                                    <strong>Опиасние</strong>: {animal.description}
                                </div>

                                <div>
                                    <strong>Тип</strong>: {animal?.type?.name || animal.type_id}
                                </div>

                                <div>
                                    <strong>Страна</strong>: {animal?.country?.name || animal.country_id}
                                </div>

                                <div>
                                    <strong>Порода</strong>: {animal?.breed?.name || animal.breed_id}
                                </div>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={12}>
                                <div>
                                    <strong>Факты:</strong> <br/>
                                    {
                                        animalFacts.map((fact: Fact, index) => (
                                            <div key={index}>
                                                {
                                                    `${index + 1}. ${fact.text}`
                                                }
                                            </div>
                                        ))
                                    }
                                </div>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={12}>
                                <div>
                                    <strong>Окрасы:</strong>
                                    <div className={"d-flex gap-4 mt-2 flex-wrap"}>
                                        {
                                            animalColorings.map((coloring: Coloring, index: number) => (
                                                <div key={index} className={"d-flex flex-column align-items-center"}>
                                                    <Image src={GetImageUrl(coloring.image_link)} alt={coloring.image_link}/>
                                                    <span>{coloring.name}</span>
                                                </div>
                                            ))
                                        }
                                    </div>

                                </div>
                            </Col>
                        </Row>
                    </Container>
                </Modal.Body>
                <Modal.Footer>
                    <button className={"button-custom"} onClick={handleClose}>
                        Закрыть
                    </button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default AnimalDetailsModal;