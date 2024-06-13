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
                    {
                        rowName: 'userName',
                        wanted: false
                    },
                    {
                        rowName: 'email',
                        wanted: false
                    },
                    {
                        rowName: 'passWord',
                        wanted: false
                    },
                ],
            }, 
            {
                tableName: 'POSTS', 
                rows: [
                    {
                        rowName: 'postName',
                        wanted: false
                    },
                    {
                        rowName: 'postID',
                        wanted: false
                    },
                    {
                        rowName: 'postPicture',
                        wanted: false
                    },
                ],
            }
        ]

    )
    const [chosenTable, setChosenTable] = useState<any>({
        tableName: '', 
        rows: [],
    })
    interface conditionStruc {
        conditionRow: String,
        conditionOperand: String,
        conditionRowSecond: String,
        isGroup: string
    }
    const [conditions, setConditions] = useState<conditionStruc[]>([])
    const [wantSee, setWantSee] = useState(-1)

    return (
        <section className="flex flex-col bg-HIGHLIGHTB w-[90%] h-[90vh] m-auto mt-2 justify-center items-center">   
            
            {chosenTable &&             
                <div className="bg-WHITE w-[20%] p-1 rounded text-center m-2 shadow-lg">
                    {chosenTable.tableName}    
                    {chosenTable.rows.map((row, index) => (
                        <p>
                            {row.wanted && row.rowName}
                        </p>
                    ))}    
                </div>  
            }
     
            <div className="bg-WHITE rounded-lg p-1 shadow text-center">
                <h2>
                    What table?
                </h2>
                {tables.map((table:any, index:number) => (
                    <button onClick={() => setChosenTable(table)} className={`${chosenTable.tableName === table.tableName ? ('bg-WHITE') : ('bg-HIGHLIGHTB')} shadow text-center p-1 w-full hover:cursor hover:opacity-60`}>
                        {table.tableName}
                    </button>
                ))}
            </div>

            <div className="bg-WHITE rounded-lg p-1 shadow text-center mt-1">
                {chosenTable && chosenTable.rows.map((row, index) => (
                    <button 
                        onClick={
                            () => 
                                setChosenTable((prevTable) => ({
                                    ...prevTable,
                                    rows: prevTable.rows.map((r) => 
                                        r.rowName === row.rowName ? { ...r, wanted: !r.wanted} : r
                                    )
                                }))
                        } 
                        className={`${row.wanted ? ('bg-WHITE') : ('bg-HIGHLIGHTB')} shadow text-center p-1 w-full hover:cursor hover:opacity-60`}>
                        {row.rowName}
                    </button>
                ))}
            </div>
            {chosenTable && 
            <section className="w-[40%]">
                <div>
                    {chosenTable.rows.find((r) => r.wanted === true) &&
                        <div className="bg-WHITE p-1 m-1 rounded text-center shadow">
                            <h2>
                                Add Conditions
                            </h2>
                            {chosenTable.rows.map((row, index) => (
                                <button
                                    onClick={() => setConditions((prevConditions) => 
                                        [...prevConditions, {conditionRow: row.rowName, conditionOperand: '', conditionRowSecond: '', isGroup: ''}]
                                    )} 
                                    className="w-full hover:cursor-pointer hover:opacity-60">
                                    {row.rowName}
                                </button>
                            ))}
                        </div>            
                    }                
                </div>

                <div className="bg-WHITE text-center rounded p-2 m-1 divide-y">
                {conditions.map((condition, index) => (
                    <div key={index} className="w-full flex flex-row justify-between">
                        {condition.isGroup !== '' ? (
                            <div className="flex flex-row justify-evenly w-full text-center mt-2 mb-2">
                                <h2>
                                    {condition.isGroup}
                                </h2>
                                <button 
                                    onClick={() => setConditions((prevConditions) => prevConditions.filter((con) => con !== conditions[index]))}
                                    className="w-[20%]"
                                >
                                    Remove
                                </button>
                            </div>
 
                        ) : (
                            <section className="w-full flex flex-row justify-between">
                                <p className="w-[20%]">{condition.conditionRow}</p>

                                <button 
                                    onClick={() => setWantSee(index !== wantSee ? index : -1)} 
                                    className="w-[20%]"
                                >
                                    {condition.conditionOperand || 'Choose'}
                                </button>

                                {wantSee !== -1 && wantSee === index && (
                                    <div className="border fixed z-10 bg-WHITE w-[120px] p-1 flex flex-col rounded">
                                        {operands.map((operand, operandIndex) => (
                                            <button 
                                                key={operandIndex}
                                                onClick={() => {
                                                    setConditions((prevConditions) => 
                                                        prevConditions.map((cond, condIndex) => 
                                                            condIndex === index ? { ...cond, conditionOperand: operand } : cond
                                                        )
                                                    );
                                                    setWantSee(-1);  // Close the operand selection
                                                }} 
                                                className="hover:opacity-60"
                                            >
                                                {operand}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <input 
                                    onChange={(e) => {
                                        setConditions((prevConditions) => 
                                            prevConditions.map((cond, condIndex) => 
                                                condIndex === index ? { ...cond, conditionRowSecond: e.target.value } : cond
                                            )
                                        );
                                    }}
                                    className="w-[20%]" 
                                    placeholder={`${condition.conditionRowSecond || 'Choose'}`}
                                />
                                <button 
                                    onClick={() => setConditions((prevConditions) => prevConditions.filter((con) => con !== conditions[index]))}
                                    className="w-[20%]"
                                >
                                    Remove
                                </button>
                            </section>
                        )}
                    </div>
                ))}
                    
                    <div>
                        <button
                            onClick={() => {
                                setConditions((prevConditions) => [
                                    ...prevConditions,
                                    {
                                        conditionRow: '',
                                        conditionOperand: '',
                                        conditionRowSecond: '',
                                        isGroup: 'AND'                                        
                                    }

                                ])
                            }}
                        >
                            AND
                        </button>
                        
                        <button
                            onClick={() => {
                                setConditions((prevConditions) => [
                                    ...prevConditions,
                                    {
                                        conditionRow: '',
                                        conditionOperand: '',
                                        conditionRowSecond: '',
                                        isGroup: 'OR'                                        
                                    }

                                ])
                            }}
                        >
                            OR
                        </button>
                    </div>
                </div>      
                          
            </section>

            
            }


        </section>
    )
}
/* Think tank


[['SELECT', 'UPDATE'], [], ['FROM'], [], ['WHERE'] [[],['AND'],[,'OR]],]

<Butt>value == this</Butt>

<butt> OR </butt>

<butt> AND</butt>


*/