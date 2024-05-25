import React, {useState, useEffect} from "react";

interface filterGroupsStruc {

        outsideConnection: string;
        comparatorOne: string;
        comparatorTwo: string;
        operand: string;
        
}

export default function SQLPRETTYGEN(){
    const operands = ['equals','Doesnt Equal','startsWith']
    const [tables, setTables] = useState(
        [
            {
                tableName: 'USERS', 
                rows: [
                    'userName',
                    'email',
                    'passWord'
                ],
            }, 
            {
                tableName: 'POSTS', 
                rows: [
                    'postName',
                    'postID',
                    'postPicture'
                ],
            }
        ]

    )
    const [chosenTable, setChosenTable] = useState("")
    const [wantedRows, setWantedRows] = useState<string[]>([])
    const [see, setSee] = useState(-1)
    const [filterGroups, setFilterGroups] = useState<filterGroupsStruc[]>([])
    useEffect(() => {
        console.log(wantedRows)
    }, [wantedRows])
    return (
        <section className="flex flex-col bg-HIGHLIGHTB w-[90%] h-[90vh] m-auto mt-2 justify-center items-center">
            {chosenTable === "" ? (            
            <div className="flex items-center w-full text-center items-center justify-center">
                Where From?                     
                <img onClick={() => {see !== 0 ? setSee(0) : setSee(-1)}} className="h-[1rem] hover:bg-WHITE hover:cursor-pointer rounded-lg " src="https://www.svgrepo.com/show/533144/mouse-alt-1.svg" alt="CLICKER" /> 
                {see === 0 && 
                    <menu className="w-[100px] relative d bg-WHITE text-BLACK rounded shadow-lg">
                        {tables.map((table, index) => (
                            <p onClick={() => {setChosenTable(table.tableName); setSee(-1)}} className="hover:opacity-60 hover:cursor-pointer" key={index}>
                                {table.tableName}
                            </p>
                        ))}                    
                    </menu>
                }               
            </div>) : (
                <section>
                    <h1>
                        Chosen table: {chosenTable} 
                    </h1>
                    <button className="bg-WHITE rounded shadow-lg p-1 m-auto justify-center flex" onClick={() => {setChosenTable('')}}>Switch table?</button>                    
                    <div>
                        <h2>
                            What do you want?
                        </h2>
                        {tables.filter((table) => table.tableName !== chosenTable).map((table, index) => (
                            <div className="bg-WHITE rounded text-center shadow-lg">
                                {table.rows.map((row, index) => (
                                    <p className="flex p-1">
                                        <button 
                                            className="hover:opacity-60 hover:cursor-pointer w-[70%] border-r"
                                            onClick={(e) => {{ 
                                                if (!wantedRows.includes(row)) {
                                                    setWantedRows((prevRows) => [...prevRows, row])
                                                } else {
                                                    setWantedRows((prevRows) => [...prevRows.filter((prevRow) => prevRow !== row)])
                                                }
                                            }}}>
                                                {row}
                                            </button> 
                                            <p className="text-center w-[30%]">{wantedRows.includes(row) ? ('Yes') : ('No')}</p>
                                            
                                    </p>
                                ))}
                            </div>
                        ))}
                    </div>
                    {wantedRows.length > 0 && (
                        <section>
                            <h2>
                                + Create filter Group
                            </h2>
                            <menu className="w-full flex flex-row justify-evenly mb-2">
                                <button 
                                    className="bg-WHITE rounded shadow-lg w-[50%] p-1" 
                                    onClick={(e) => {
                                        setFilterGroups((prevGroups) => [...prevGroups, {
                                            outsideConnection: 'AND',
                                            comparatorOne: '',
                                            comparatorTwo: '',
                                            operand: ''
                                        }])
                                }}> 
                                    AND 
                                </button>
                                <button 
                                    className="bg-WHITE rounded shadow-lg  w-[50%] p-1" 
                                    onClick={(e) => {
                                        setFilterGroups((prevGroups) => [...prevGroups, {
                                            outsideConnection: 'OR',
                                            comparatorOne: '',
                                            comparatorTwo: '',
                                            operand: ''
                                        }])
                                }}> 
                                    OR 
                                </button>                                 
                            </menu>
                               
                                {filterGroups.length > 0 && filterGroups.map((group, index) => (
                                    <section key={index} className="flex flex-col justify-evenly">
                                        <div className="bg-WHITE w-full flex items-center justify-center">
                                            <p className="border-r w-[70%] text-center">
                                                {group.outsideConnection} 
                                            </p>
                                            <button className="text-center items-center flex justify-center w-[30%]" onClick={() => {setFilterGroups((prevGroups) => prevGroups.filter((chosenGroup) => chosenGroup === group))}} >-</button>
                                        </div>
                                        {group.comparatorOne == "" && group.comparatorTwo == '' && (
                                            <div>
                                                <h2 className="text-center">
                                                    Choose
                                                </h2>

                                                <div className="flex flex-col">
                                                {tables.filter((table) => table.tableName !== chosenTable).map((table, index) => (
                                                    <div key={index} className="bg-WHITE rounded text-center shadow-lg">
                                                        {table.rows.map((row, index) => (
                                                            <p   
                                                                className="hover:opacity-60 flex p-1"
                                                                onClick={() => {{ 
                                                                if (group.comparatorOne == '') {
                                                                    group.comparatorOne = row
                                                                    console.log(group.comparatorOne)
                                                                } else {
                                                                    group.comparatorTwo = row
                                                                    console.log(group.comparatorTwo)
                                                                }
                                                            }}}>
                                                                {row}
                                                            </p>
                                                        ))}
                                                    </div>
                                                ))}                                                 
                                                </div>
                                            </div>
                                        )}
                                        {group.comparatorOne && group.comparatorTwo && (
                                            <div>
                                                <p className="w-full flex justify-between">
                                                    <p>{group.comparatorOne}</p>
                                                    <p>{group.operand || ''}</p>
                                                    <p>{group.comparatorTwo}</p>
                                                </p>                          
                                                <div className="bg-WHITE rounded shadow-lg">
                                                {operands.map((oper, index) => (
                                                    <p onClick={() => group.operand === oper} key={index} className="hover:opacity-60 hover:cursor-pointer text-center">
                                                        {oper}
                                                    </p>
                                                ))}                                                  
                                                </div>                      
                                                
                                            </div> 
                                        )}


                                    </section>
                                ))}
                        </section>
                    ) }
                </section>
            )}
        </section>
    )
}