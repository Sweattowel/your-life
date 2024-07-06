import React, { useState } from "react"

export default function SQLSQUAREGEN() {
    const [ table, setTable ] = useState<any[]>(
        [
            {column: 'firstName', rows: ['pete', 'jean', 'louis', 'peter']},
            {column: 'lastName', rows: ['louis', 'pete', 'jean', 'peter']},
            {column: 'untitled', rows: ['jean', 'pete', 'louis', 'peter']},
        ]
    
    )
    
    return (
        <section>
            <h1>
                Formatted excel type sql generator
            </h1>
            <div className="border-[2px] border-BLACK w-[80%] m-auto flex justify-evenly text-center">
                {table.map((data:any, index:number) => (
                    <div key={index} className="border w-full">
                        <h2 className="text-BOLD border-b">
                            {data.column}                             
                        </h2>

                        {data.rows.map((row:any, index:number) => (
                            <p>
                                {row}
                            </p>
                        ))}
                    </div>
                )
                )}
            </div>
        </section>
    )
}