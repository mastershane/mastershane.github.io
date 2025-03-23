import React from "react"
import { CamelState, Tile as StateTile } from "./camel"

interface Props {
    state: CamelState
}

export const Visualizer = ({state}: Props ) => {
    return <div style={{display: "flex", gap: "10px", flexWrap: "wrap"}}>
        {state.tiles.map(t => <Tile tile={t}/>)}
    </div>
}

const Tile = ({tile}: {tile: StateTile }) => {

    const hazardColor = tile.hazard === "Desert" ? "yellow" 
        : tile.hazard === "Oasis" ? "aqua" 
        : undefined

    return <div style={{
        height: "40px", 
        width: "40px", 
        border: "1px solid black",
        display: "flex",
        flexDirection: "column-reverse",
        backgroundColor: hazardColor
    }}>
        {tile.camels.map(c => {
            return <div style={{
                height: "8px", 
                width: "39px",
                border: "1px solid black",
                backgroundColor: c, 
                fontSize: "6px"
            }}></div>
        })}
    </div>
}