import React, { useEffect, useState } from "react";

interface SQLDATA {
    choice: string;
    curr: string;
    hasChildren: boolean;
}

export default function SQLGEN() {
    const [see, setSee] = useState(false)
    const [table, setTable] = useState('USERS')
    const [currString, setCurrString] = useState(["SELECT"])
    const intruders: string[] = [
        'WHERE',
        'AND',
        'OR',
        '(',
    ]
    const [rows, setRows] = useState(['userName', 'passWord', 'userID'])    
    function appendSql(input: string, index: number) {
        setCurrString((prevItems) => [
            ...prevItems,
            `${input}`
        ])
        setSee(false)
    }
    useEffect(() => {
        if (currString[currString.length - 1] === '=' || currString[currString.length - 1] === '!='){
            setCurrString((prevItems) => [
                ...prevItems,
                `textInput`
            ])
        }
        console.log(currString)
    }, [currString])
    return (
        <section className=" text-WHITE flex flex-row justify-center items-center text-center bg-HIGHLIGHTB m-auto w-[90%] h-[80vh] mt-[5vh] rounded">
            {currString.map((curr, index) => (
                <div className="flex items-center" key={index}>
                    <p className="mr-1">
                        {curr.split(' ')[0] !== 'textInput' ? curr : (
                            <input
                            className="text-BLACK"
                                onChange={(e) => {
                                    let newString = [...currString]
                                    newString[index] = `textInput ${e.target.value}`
                                    setCurrString(newString)
                                }}
                                placeholder={curr.split(' ')[1]}
                            />
                        )}
                    </p>
                    <div>
                    {index === currString.length - 1 &&
                        <img onClick={() => {setSee(!see)}} className="ml- h-[1rem] hover:bg-WHITE hover:cursor-pointer rounded-lg " src="https://www.svgrepo.com/show/533144/mouse-alt-1.svg" alt="CLICKER" /> 
                    }     
                    {index === currString.length - 1 && see &&                 
                        <menu className="w-[100px] fixed bg-WHITE text-BLACK rounded shadow-lg">
                            <ul>
                                {rows.map((row, index) => (
                                    <li className="hover:opacity-60 hover:cursor-pointer" onClick={() => {appendSql(`${row}`, index)}} > {row.toLowerCase()}</li>
                                ))}
                                {rows.includes(currString[index]) && intruders.includes(currString[index - 1]) && <li className="hover:opacity-60 hover:cursor-pointer" onClick={() => {appendSql("=", index)}} >=</li>}
                                {rows.includes(currString[index]) && intruders.includes(currString[index - 1]) && <li className="hover:opacity-60 hover:cursor-pointer" onClick={() => {appendSql("!=", index)}} >!=</li>}
                                {!intruders.includes(curr) && <li className="hover:opacity-60 hover:cursor-pointer" onClick={() => {appendSql("WHERE", index)}} > WHERE</li>}
                                {!intruders.includes(curr) && <li className="hover:opacity-60 hover:cursor-pointer" onClick={() => {appendSql("AND", index)}} > AND</li>}
                                {!intruders.includes(curr) && <li className="hover:opacity-60 hover:cursor-pointer" onClick={() => {appendSql("OR", index)}} > OR</li>}
                                {intruders.includes(curr) && <li className="hover:opacity-60 hover:cursor-pointer" onClick={() => {appendSql("(", index)}} > OPEN</li>}
                                {!intruders.includes(curr) && <li className="hover:opacity-60 hover:cursor-pointer" onClick={() => {appendSql(")", index)}} > CLOSE</li>}

                            </ul>
                        </menu> 
                    }
                    </div> 
                </div>   
            ))} 
            <p>
                FROM {table}
            </p>
        </section>
    )
}