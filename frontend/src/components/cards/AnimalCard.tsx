import 'react';
import type {Animal} from "../../api/animal.ts";
import {Card} from "react-bootstrap";
import {GetImageUrl} from "../utils/imageHelper.ts";

type AnimalCardProps = {
    animal: Animal;
    onClick: (animal: Animal) => void;
}

const AnimalCard = ({animal, onClick}:AnimalCardProps) => {
    return (
        <Card className={"animal-card"}>
            <Card.Img src={GetImageUrl(animal.image_link)} alt={animal.image_link} />
            <Card.Body>
                <Card.Title>{animal.name}</Card.Title>
                <Card.Text>
                    {animal.description.length > 128
                        ? `${animal.description.substring(0, 128)}...`
                        : animal.description}
                </Card.Text>
            </Card.Body>
            <Card.Footer className={"d-flex justify-content-center align-items-center"}>
                <button className={"button-custom"} onClick={() => onClick(animal)}>
                    Подробнее
                </button>
            </Card.Footer>
        </Card>
    );
};

export default AnimalCard;