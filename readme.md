////////////////////////////////////////////////////////////////////////////////
//                             MQTT Pattern                                   //
////////////////////////////////////////////////////////////////////////////////

To Publish Sensor Values

  TOPIC:		/[FACTORY_SLUG]/[MACHINE_SLUG]/[BOARD_SLUG]/[SENSOR_SLUG]/output
  PAYLOAD:	SENSOR_VALUE

  Example

  TOPIC:		/sit/smart-trash/mcu-1/temp/output
  PAYLOAD:	44.5

  TOPIC:		/cp-f/silo-3/linkit-1/current-a/output
  PAYLOAD:	5.25


SLUG CONVENTION
  1. only a-z and 0-9 are allowed
  2. uppercase are NOT allowed
  3. special letters can be used only "-"

////////////////////////////////////////////////////////////////////////////////
//                             Database                                       //
////////////////////////////////////////////////////////////////////////////////

Structure

/antalot
 |_ /factories
     |_ /[FACTORY_NAME]
         |_ info
         |_ machines
            |_ [MACHINES_NAME]
               |_ info
               |_ boards
                  |_ [BOARD_NAME]
                     |_ info
                     |_ sensors
                        |_ [SENSOR_NAME]
                           |_ info
                           |_ output
